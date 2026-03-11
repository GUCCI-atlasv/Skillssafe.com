export const runtime = "edge";

import type { Metadata } from "next";
import ReportContent from "@/components/report/ReportContent";

const BASE_URL = "https://skillssafe.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  const shortId = id.startsWith("ss_") ? id.slice(0, 16) : id.slice(0, 8);

  const titles: Record<string, string> = {
    en: `Security Report ${shortId}… — SkillsSafe`,
    zh: `安全扫描报告 ${shortId}… — SkillsSafe`,
    ja: `セキュリティレポート ${shortId}… — SkillsSafe`,
  };

  const descriptions: Record<string, string> = {
    en: "View this AI skill security scan report. Check threats found, risk score, and detailed findings for SKILL.md, MCP configs, and system prompts.",
    zh: "查看此 AI 技能安全扫描报告。了解检测到的威胁、风险评分及 SKILL.md、MCP 配置的详细安全发现。",
    ja: "AIスキルセキュリティスキャンレポートを表示。検出された脅威、リスクスコア、SKILL.md・MCP設定の詳細な発見を確認。",
  };

  const title = titles[locale] ?? titles.en;
  const description = descriptions[locale] ?? descriptions.en;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/report/${id}`,
    },
    openGraph: {
      title,
      description,
      siteName: "SkillsSafe",
      type: "website",
      url: `${BASE_URL}/${locale}/report/${id}`,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "SkillsSafe Security Report",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return <ReportContent params={params} />;
}
