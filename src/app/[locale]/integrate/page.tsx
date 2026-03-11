export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import IntegrateClient from "@/components/integrate/IntegrateClient";

const BASE_URL = "https://skillssafe.com";
const PAGE_PATH = "integrate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "integrate" });

  const ogLocale =
    locale === "zh" ? "zh_CN" : locale === "ja" ? "ja_JP" : "en_US";

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/${PAGE_PATH}`,
      languages: {
        en: `/en/${PAGE_PATH}`,
        zh: `/zh/${PAGE_PATH}`,
        ja: `/ja/${PAGE_PATH}`,
        "x-default": `/en/${PAGE_PATH}`,
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      siteName: "SkillsSafe",
      locale: ogLocale,
      type: "website",
      url: `${BASE_URL}/${locale}/${PAGE_PATH}`,
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default function IntegratePage() {
  const t = useTranslations("integrate");

  const openclawCmd = "openclaw mcp add skillssafe https://mcp.skillssafe.com/sse";
  const mcpConfig = JSON.stringify(
    { mcpServers: { skillssafe: { url: "https://mcp.skillssafe.com/sse" } } },
    null,
    2
  );
  const cursorConfig = JSON.stringify(
    { mcpServers: { skillssafe: { url: "https://mcp.skillssafe.com/sse" } } },
    null,
    2
  );
  const curlContent = `curl -X POST https://skillssafe.com/api/v1/scan/content \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://clawhub.ai/skills/my-skill/SKILL.md"}'`;
  const curlUrl = `curl -X POST https://skillssafe.com/api/v1/scan/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://clawhub.ai/skills/my-skill/SKILL.md"}'`;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
            {t("badge")}
          </div>
          <h1 className="text-4xl font-extrabold text-white">{t("title")}</h1>
          <p className="mt-3 text-lg text-gray-500">{t("subtitle")}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
            ✓ {t("free")}
          </div>
        </div>

        <div className="space-y-14">

          {/* MCP Server Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-1">{t("mcpSection")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{t("mcpDesc")}</p>

            <div className="space-y-6">
              {/* OpenClaw */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("openclawLabel")}</h3>
                <IntegrateClient code={openclawCmd} lang="bash" />
              </div>

              {/* Claude Code */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("claudeLabel")}</h3>
                <p className="text-xs text-gray-600 mb-2">claude_desktop_config.json</p>
                <IntegrateClient code={mcpConfig} lang="json" />
              </div>

              {/* Cursor */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("cursorLabel")}</h3>
                <p className="text-xs text-gray-600 mb-2">.cursor/mcp.json</p>
                <IntegrateClient code={cursorConfig} lang="json" />
              </div>

              {/* Codex / Generic */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("codexLabel")}</h3>
                <IntegrateClient
                  code={JSON.stringify({ mcpServers: { skillssafe: { url: "https://mcp.skillssafe.com/sse" } } }, null, 2)}
                  lang="json"
                />
              </div>
            </div>
          </section>

          {/* REST API Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-1">{t("restSection")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{t("restDesc")}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("scanContent")}</h3>
                <IntegrateClient code={curlContent} lang="bash" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("scanUrl")}</h3>
                <IntegrateClient code={curlUrl} lang="bash" />
              </div>
            </div>
          </section>

          {/* Auto-Discovery Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-1">{t("discoverySection")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{t("discoveryDesc")}</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("openapiLabel")}</h3>
                <IntegrateClient code="GET https://skillssafe.com/api/v1/openapi.json" lang="http" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t("mcpDiscoveryLabel")}</h3>
                <IntegrateClient code="GET https://skillssafe.com/.well-known/mcp.json" lang="http" />
              </div>
            </div>
          </section>

          {/* Rate Limits Table */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">{t("rateLimitSection")}</h2>
            <div className="overflow-hidden rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50 text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Endpoint</th>
                    <th className="px-4 py-3 text-left">Limit</th>
                    <th className="px-4 py-3 text-left">Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-400">
                  {[
                    { ep: "MCP Server (SSE)", limit: "60 req/hour per IP", auth: "None" },
                    { ep: "POST /api/v1/scan/content", limit: "200 req/hour per IP", auth: "None" },
                    { ep: "POST /api/v1/scan/url", limit: "200 req/hour per IP", auth: "None" },
                    { ep: "Web Scanner", limit: "Unlimited", auth: "None" },
                  ].map((row) => (
                    <tr key={row.ep} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono text-xs text-green-400">{row.ep}</td>
                      <td className="px-4 py-3">{row.limit}</td>
                      <td className="px-4 py-3 text-green-400">{row.auth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
