import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { scanContent, type Lang } from "@/lib/scanner/engine";
import { saveReport } from "@/lib/db/reports";

export const runtime = "edge";

const BLOCKED_DOMAINS = new Set([
  "localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "::1",
]);

function isBlockedUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (!["http:", "https:"].includes(u.protocol)) return true;
    if (BLOCKED_DOMAINS.has(u.hostname)) return true;
    if (/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)) return true;
    return false;
  } catch {
    return true;
  }
}

function normalizeUrl(urlStr: string): string {
  if (urlStr.includes("github.com") && !urlStr.includes("raw.githubusercontent")) {
    return urlStr
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }
  return urlStr;
}

function getDB() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getRequestContext().env as any).DB ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { url?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, lang = "en" } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Missing required field: url (string)" },
      { status: 400 }
    );
  }

  if (isBlockedUrl(url)) {
    return NextResponse.json({ error: "Invalid or blocked URL" }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(url);
  let content: string;

  try {
    const response = await fetch(normalizedUrl, {
      headers: { "User-Agent": "SkillsSafe-Scanner/1.0 (https://skillssafe.com)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 422 }
      );
    }
    content = await response.text();
    if (content.length > 500_000) content = content.slice(0, 500_000);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch URL: ${e instanceof Error ? e.message : "Unknown error"}` },
      { status: 422 }
    );
  }

  const validLangs = ["en", "zh", "ja"];
  const scanLang: Lang = validLangs.includes(lang) ? (lang as Lang) : "en";
  const result = scanContent(content, scanLang);

  // Persist to D1 — must await; CF Workers kill unresolved promises on response
  await saveReport(result, url, getDB());

  return NextResponse.json(
    {
      decision: result.decision,
      score: result.score,
      risk_level: result.risk_level,
      threat_count: result.threat_count,
      top_threats: result.top_threats,
      zero_width_count: result.zero_width_count,
      scan_id: result.scan_id,
      scanned_at: result.scanned_at,
      lang: result.lang,
      recommendation: result.recommendation,
      source_url: url,
      report_url: `https://skillssafe.com/report/${result.scan_id}`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
