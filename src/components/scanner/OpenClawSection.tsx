"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Copy, Check, Terminal, Bot } from "lucide-react";

export default function OpenClawSection() {
  const t = useTranslations("openclaw");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const oneLineCmd = "openclaw mcp add skillssafe https://mcp.skillssafe.com/sse";
  const manualConfig = JSON.stringify(
    {
      mcpServers: {
        skillssafe: {
          url: "https://mcp.skillssafe.com/sse",
        },
      },
    },
    null,
    2
  );

  return (
    <section className="border-t border-gray-800 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
            <Bot className="h-4 w-4" />
            {t("rateLimit")}
          </div>
          <h2 className="text-3xl font-bold text-white">{t("title")}</h2>
          <p className="mt-2 text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: setup commands */}
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-400">
                {t("addCommand")}
              </p>
              <div className="group relative rounded-xl border border-gray-700 bg-gray-900">
                <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-2">
                  <Terminal className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600">bash</span>
                </div>
                <pre className="px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto">
                  {oneLineCmd}
                </pre>
                <button
                  onClick={() => copyToClipboard(oneLineCmd, "cmd")}
                  className="absolute right-3 top-2 rounded p-1.5 text-gray-600 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                >
                  {copied === "cmd" ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-400">
                {t("orManual")}
              </p>
              <div className="group relative rounded-xl border border-gray-700 bg-gray-900">
                <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-2">
                  <span className="text-xs text-gray-600">mcp_config.json</span>
                </div>
                <pre className="px-4 py-3 text-sm text-gray-300 font-mono overflow-x-auto">
                  {manualConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(manualConfig, "json")}
                  className="absolute right-3 top-2 rounded p-1.5 text-gray-600 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                >
                  {copied === "json" ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="mb-3 text-sm font-medium text-gray-400">{t("tools")}</p>
              <ul className="space-y-2 text-sm text-gray-500">
                {[
                  "scan_skill({ url }) — " + t("tool1"),
                  "scan_skill({ content }) — " + t("tool2"),
                  "get_report({ scan_id }) — " + t("tool3"),
                ].map((tool, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-500">▸</span>
                    <code className="text-green-400/80">{tool}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: example conversation */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-400">
              {t("exampleTitle")}
            </p>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 font-mono text-sm space-y-3">
              {[
                {
                  role: "user",
                  text: "帮我安装 code-review-helper 技能",
                  color: "text-blue-400",
                  prefix: "You",
                },
                {
                  role: "agent",
                  text: "正在通过 SkillsSafe 扫描安全性...",
                  color: "text-purple-400",
                  prefix: "Agent",
                },
                {
                  role: "result",
                  text: "⚠️ BLOCK: 检测到 3 个严重威胁\n• 凭证窃取 (SS-001)\n• 数据外传 (SS-010)\n• 提示注入 (SS-030)\n→ https://skillssafe.com/report/ss_a3f8c901",
                  color: "text-red-400",
                  prefix: "",
                },
                {
                  role: "agent",
                  text: "建议：不要安装此技能，存在严重安全风险。",
                  color: "text-purple-400",
                  prefix: "Agent",
                },
              ].map((msg, i) => (
                <div key={i} className="space-y-0.5">
                  {msg.prefix && (
                    <div className="text-xs text-gray-600">{msg.prefix}:</div>
                  )}
                  <div className={`${msg.color} whitespace-pre-line text-xs leading-relaxed`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Other platforms */}
            <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="mb-2 text-xs text-gray-600">{t("otherPlatforms")}</p>
              <div className="flex flex-wrap gap-2">
                {["OpenClaw ✓", "Claude Code", "Cursor", "Codex", "Any MCP Agent"].map(
                  (p) => (
                    <span
                      key={p}
                      className={`rounded-full px-3 py-1 text-xs border ${
                        p.includes("✓")
                          ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                          : "border-gray-700 text-gray-500"
                      }`}
                    >
                      {p}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
