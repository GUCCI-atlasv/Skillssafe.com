"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import type { ScanResult } from "@/lib/scanner/engine";

const SEVERITY_COLORS = {
  critical: "bg-red-500/10 border-red-500/30 text-red-400",
  high: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  medium: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  low: "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

const SEVERITY_BADGE = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-gray-900",
  low: "bg-blue-500 text-white",
};

const DECISION_CONFIG = {
  INSTALL: {
    icon: ShieldCheck,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    badge: "bg-green-500 text-gray-950",
  },
  REVIEW: {
    icon: ShieldAlert,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    badge: "bg-yellow-500 text-gray-950",
  },
  BLOCK: {
    icon: ShieldX,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500 text-white",
  },
};

interface Props {
  result: ScanResult;
}

export default function ScanResults({ result }: Props) {
  const t = useTranslations("results");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [expandedThreats, setExpandedThreats] = useState<Set<number>>(
    new Set([0])
  );

  const config = DECISION_CONFIG[result.decision];
  const Icon = config.icon;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${locale}/report/${result.scan_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillssafe-${result.scan_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleThreat = (idx: number) => {
    setExpandedThreats((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Decision card */}
      <div className={`rounded-2xl border p-6 ${config.bg}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className={`h-10 w-10 ${config.color} flex-shrink-0`} />
            <div>
              <div
                className={`inline-block rounded-lg px-3 py-1 text-sm font-bold ${config.badge}`}
              >
                {t(`decision.${result.decision}`)}
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Score ring */}
          <div className="flex-shrink-0 text-center">
            <div
              className={`text-3xl font-bold ${
                result.score >= 70
                  ? "text-green-400"
                  : result.score >= 40
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {result.score}
            </div>
            <div className="text-xs text-gray-500">{t("score")}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-1.5 text-sm">
            <span className="text-gray-400">{t("threats")}:</span>
            <span
              className={`font-bold ${result.threat_count > 0 ? "text-red-400" : "text-green-400"}`}
            >
              {result.threat_count}
            </span>
          </div>
          {result.zero_width_count > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-1.5 text-sm border border-orange-500/20">
              <span className="text-orange-400">
                ⚠️ {result.zero_width_count} hidden Unicode chars
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-3 py-1.5 text-sm">
            <span className="text-gray-500 text-xs font-mono">{result.scan_id}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/report/${result.scan_id}`}
            className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("viewReport")}
          </Link>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : t("shareReport")}
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportJson")}
          </button>
        </div>
      </div>

      {/* Threats list */}
      {result.threats.length === 0 ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center text-gray-400">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-green-400" />
          {t("noThreats")}
        </div>
      ) : (
        <div className="space-y-2">
          {result.threats.map((threat, idx) => (
            <div
              key={idx}
              className={`rounded-xl border ${SEVERITY_COLORS[threat.severity]} overflow-hidden`}
            >
              <button
                onClick={() => toggleThreat(idx)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-bold ${SEVERITY_BADGE[threat.severity]}`}
                  >
                    {t(`severity.${threat.severity}`)}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {threat.description}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-500">
                    L{threat.line_number}
                  </span>
                  {expandedThreats.has(idx) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </button>

              {expandedThreats.has(idx) && (
                <div className="border-t border-current/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                      {threat.rule_id}
                    </span>
                    <span>
                      {t(`threatCategories.${threat.category}`)}
                    </span>
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
  );
}
