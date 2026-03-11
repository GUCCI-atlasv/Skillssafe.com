import {
  SCAN_RULES,
  ZERO_WIDTH_CHARS,
  SEVERITY_SCORES,
  type Severity,
  type Category,
} from "./rules";

export type Decision = "INSTALL" | "REVIEW" | "BLOCK";
export type Lang = "en" | "zh" | "ja";

export interface Threat {
  rule_id: string;
  category: Category;
  severity: Severity;
  description: string;
  line_number: number;
  line_content: string;
  matched_text: string;
}

export interface ZeroWidthOccurrence {
  char_code: string;
  position: number;
  line_number: number;
  context: string;
}

export interface ScanResult {
  decision: Decision;
  score: number;
  risk_level: "SAFE" | "CAUTION" | "DANGER" | "CRITICAL";
  threat_count: number;
  threats: Threat[];
  zero_width_chars: ZeroWidthOccurrence[];
  zero_width_count: number;
  top_threats: string[];
  scanned_at: string;
  scan_id: string;
  content_length: number;
  lang: Lang;
  recommendation: string;
}

function generateScanId(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 10);
  return `ss_${rand}_${timestamp}`;
}

function detectZeroWidthChars(content: string): ZeroWidthOccurrence[] {
  const occurrences: ZeroWidthOccurrence[] = [];
  const lines = content.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const code = ZERO_WIDTH_CHARS[char];
      if (code) {
        const contextStart = Math.max(0, charIdx - 20);
        const contextEnd = Math.min(line.length, charIdx + 20);
        occurrences.push({
          char_code: code,
          position: charIdx,
          line_number: lineIdx + 1,
          context: line.slice(contextStart, contextEnd),
        });
      }
    }
  }

  return occurrences;
}

function getDescription(threat: (typeof SCAN_RULES)[0], lang: Lang): string {
  if (lang === "zh") return threat.description_zh;
  if (lang === "ja") return threat.description_ja;
  return threat.description_en;
}


export function scanContent(content: string, lang: Lang = "en"): ScanResult {
  const lines = content.split("\n");
  const threats: Threat[] = [];

  for (const rule of SCAN_RULES) {
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);
      if (match) {
        threats.push({
          rule_id: rule.id,
          category: rule.category,
          severity: rule.severity,
          description: getDescription(rule, lang),
          line_number: lineIdx + 1,
          line_content: line.trim().slice(0, 200),
          matched_text: match[0],
        });
        rule.pattern.lastIndex = 0;
      }
    }
  }

  const zeroWidthChars = detectZeroWidthChars(content);

  if (zeroWidthChars.length > 0) {
    threats.push({
      rule_id: "SS-ZWC",
      category: "zero_width",
      severity: "high",
      description:
        lang === "zh"
          ? `检测到 ${zeroWidthChars.length} 个零宽字符（隐藏 Unicode）`
          : lang === "ja"
            ? `${zeroWidthChars.length}個のゼロ幅文字を検出しました`
            : `Detected ${zeroWidthChars.length} zero-width character(s)`,
      line_number: zeroWidthChars[0].line_number,
      line_content: zeroWidthChars[0].context,
      matched_text: `U+${zeroWidthChars[0].char_code}`,
    });
  }

  let rawScore = 0;
  for (const threat of threats) {
    rawScore += SEVERITY_SCORES[threat.severity];
  }
  const score = Math.max(0, Math.min(100, 100 - rawScore));

  const hasCritical = threats.some((t) => t.severity === "critical");
  const hasHigh = threats.some((t) => t.severity === "high");

  let decision: Decision;
  let risk_level: ScanResult["risk_level"];

  if (hasCritical || score < 30) {
    decision = "BLOCK";
    risk_level = "CRITICAL";
  } else if (hasHigh || score < 60) {
    decision = "REVIEW";
    risk_level = hasCritical ? "CRITICAL" : score < 45 ? "DANGER" : "CAUTION";
  } else {
    decision = "INSTALL";
    risk_level = "SAFE";
  }

  const recommendations: Record<Decision, Record<Lang, string>> = {
    INSTALL: {
      en: "This skill passed all security checks.",
      zh: "此技能通过了所有安全检查。",
      ja: "このスキルはすべてのセキュリティチェックに合格しました。",
    },
    REVIEW: {
      en: "This skill has some concerns. Review the findings before installing.",
      zh: "此技能存在一些风险，请在安装前仔细审查发现的问题。",
      ja: "このスキルにはいくつかの懸念事項があります。インストール前に確認してください。",
    },
    BLOCK: {
      en: "This skill has critical security threats. Do not install.",
      zh: "此技能存在严重安全威胁，请勿安装。",
      ja: "このスキルには重大なセキュリティ脅威があります。インストールしないでください。",
    },
  };

  const topThreats = threats.slice(0, 5).map((t) => {
    const sev = t.severity.toUpperCase();
    return `${sev}: ${t.description}`;
  });

  return {
    decision,
    score,
    risk_level,
    threat_count: threats.length,
    threats,
    zero_width_chars: zeroWidthChars,
    zero_width_count: zeroWidthChars.length,
    top_threats: topThreats,
    scanned_at: new Date().toISOString(),
    scan_id: generateScanId(),
    content_length: content.length,
    lang,
    recommendation: recommendations[decision][lang],
  };
}

export function detectZeroWidth(content: string) {
  return detectZeroWidthChars(content);
}
