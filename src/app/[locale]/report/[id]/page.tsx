"use client";

export const runtime = "edge";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Share2,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Threat {
  rule_id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  line_number: number;
  line_content: string;
  matched_text: string;
}

interface ReportData {
  scan_id: string;
  decision: "INSTALL" | "REVIEW" | "BLOCK";
  score: number;
  risk_level: string;
  threat_count: number;
  zero_width_count: number;
  threats: Threat[];
  recommendation: string;
  lang: string;
  source_url?: string;
  content_length: number;
  scanned_at: string;
}

const DECISION_CONFIG = {
  INSTALL: { icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", badge: "bg-green-500 text-gray-950" },
  REVIEW: { icon: ShieldAlert, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", badge: "bg-yellow-500 text-gray-950" },
  BLOCK: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", badge: "bg-red-500 text-white" },
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-gray-900",
  low: "bg-blue-500 text-white",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 border-red-500/30",
  high: "bg-orange-500/10 border-orange-500/30",
  medium: "bg-yellow-500/10 border-yellow-500/30",
  low: "bg-blue-500/10 border-blue-500/30",
};

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("report");
  const tResults = useTranslations("results");
  const locale = useLocale();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    fetch(`/api/v1/report/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setReport(data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillssafe-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleThreat = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToScanner")}
        </Link>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900 p-10 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Report Not Found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This report may have expired or the ID is incorrect. Reports are stored for 30 days.
            </p>
            <p className="text-xs text-gray-600 mt-3 font-mono">{id}</p>
            <Link
              href={`/${locale}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 font-semibold text-gray-950 hover:bg-green-400 transition-colors"
            >
              Run a New Scan
            </Link>
          </div>
        )}

        {/* Report content */}
        {!loading && report && (() => {
          const config = DECISION_CONFIG[report.decision];
          const Icon = config.icon;
          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <><Share2 className="h-3.5 w-3.5" /><Copy className="h-3 w-3" /></>}
                    {copied ? t("copied") : t("shareLink")}
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    JSON
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  { label: t("scanDate"), value: new Date(report.scanned_at).toLocaleString(locale) },
                  { label: t("scanId"), value: report.scan_id.slice(0, 16) + "..." },
                  { label: t("source"), value: report.source_url ? "URL" : t("pastedContent") },
                  { label: "Size", value: `${(report.content_length / 1024).toFixed(1)} KB` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                    <div className="text-xs text-gray-500">{m.label}</div>
                    <div className="mt-0.5 text-xs text-gray-300 truncate font-mono">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Decision card */}
              <div className={`rounded-2xl border p-6 ${config.bg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-10 w-10 ${config.color} flex-shrink-0`} />
                    <div>
                      <span className={`inline-block rounded-lg px-3 py-1 text-sm font-bold ${config.badge}`}>
                        {tResults(`decision.${report.decision}`)}
                      </span>
                      <p className="mt-1 text-sm text-gray-400">{report.recommendation}</p>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className={`text-3xl font-bold ${report.score >= 70 ? "text-green-400" : report.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                      {report.score}
                    </div>
                    <div className="text-xs text-gray-500">{tResults("score")}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-1.5 text-sm">
                    <span className="text-gray-400">{tResults("threats")}:</span>
                    <span className={`font-bold ${report.threat_count > 0 ? "text-red-400" : "text-green-400"}`}>
                      {report.threat_count}
                    </span>
                  </div>
                  {report.zero_width_count > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-sm">
                      <span className="text-orange-400">⚠️ {report.zero_width_count} hidden chars</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Threats */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  {t("findings")}
                </h2>
                {report.threats.length === 0 ? (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center text-gray-400">
                    <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-green-400" />
                    {t("noFindings")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {report.threats.map((threat, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border ${SEVERITY_COLORS[threat.severity] || ""} overflow-hidden`}
                      >
                        <button
                          onClick={() => toggleThreat(idx)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-bold ${SEVERITY_BADGE[threat.severity] || ""}`}>
                              {tResults(`severity.${threat.severity}`)}
                            </span>
                            <span className="text-sm font-medium truncate">{threat.description}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-xs text-gray-500">L{threat.line_number}</span>
                            {expanded.has(idx) ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                          </div>
                        </button>
                        {expanded.has(idx) && (
                          <div className="border-t border-current/20 px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">{threat.rule_id}</span>
                              <span>{tResults(`threatCategories.${threat.category}`)}</span>
                            </div>
                            {threat.line_content && (
                              <pre className="text-xs bg-gray-900/50 rounded-lg p-3 overflow-x-auto text-gray-300 font-mono whitespace-pre-wrap break-all">
                                {threat.line_content}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
