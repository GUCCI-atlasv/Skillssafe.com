"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Search } from "lucide-react";
import { detectZeroWidth, type ZeroWidthOccurrence } from "@/lib/scanner/engine";

const CHAR_COLORS: Record<string, string> = {
  "200B": "bg-red-500/80 text-white",
  "200C": "bg-orange-500/80 text-white",
  "200D": "bg-yellow-500/80 text-gray-900",
  FEFF: "bg-purple-500/80 text-white",
  "200E": "bg-blue-500/80 text-white",
  "200F": "bg-indigo-500/80 text-white",
  "2060": "bg-pink-500/80 text-white",
};

export default function ZeroWidthDetector() {
  const t = useTranslations("zeroWidth");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ZeroWidthOccurrence[] | null>(null);
  const [revealMode, setRevealMode] = useState(false);

  const handleDetect = () => {
    const found = detectZeroWidth(input);
    setResults(found);
  };

  const renderRevealedText = () => {
    if (!input) return null;
    const chars = Array.from(input);
    return chars.map((char, idx) => {
      const code = Object.entries({
        "\u200B": "200B",
        "\u200C": "200C",
        "\u200D": "200D",
        "\uFEFF": "FEFF",
        "\u200E": "200E",
        "\u200F": "200F",
        "\u2060": "2060",
        "\u2061": "2061",
        "\u2062": "2062",
        "\u2063": "2063",
        "\u2064": "2064",
      }).find(([c]) => c === char)?.[1];

      if (code) {
        const colorClass = CHAR_COLORS[code] || "bg-gray-500/80 text-white";
        return (
          <span
            key={idx}
            className={`inline-flex items-center rounded px-1 py-0.5 text-xs font-mono mx-0.5 cursor-help ${colorClass}`}
            title={`U+${code}`}
          >
            U+{code}
          </span>
        );
      }
      return <span key={idx}>{char}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("pastePlaceholder")}
          rows={8}
          className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-mono"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDetect}
          disabled={!input.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition-all hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {t("detectButton")}
        </button>
        {results !== null && (
          <button
            onClick={() => setRevealMode(!revealMode)}
            className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {revealMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {t("toggleReveal")}
          </button>
        )}
      </div>

      {/* Results */}
      {results !== null && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center text-gray-400">
              ✅ {t("noHidden")}
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 font-semibold">
                    ⚠️ {results.length} {t("foundChars")}
                  </span>
                  <div className="flex gap-2">
                    {[...new Set(results.map((r) => r.char_code))].map(
                      (code) => (
                        <span
                          key={code}
                          className={`rounded px-2 py-0.5 text-xs font-mono ${CHAR_COLORS[code] || "bg-gray-500/80 text-white"}`}
                        >
                          U+{code}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Reveal mode display */}
              {revealMode && (
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                  <div className="mb-2 text-xs text-gray-500">{t("charMap")}</div>
                  <div className="leading-relaxed text-sm text-gray-300 font-mono break-all">
                    {renderRevealedText()}
                  </div>
                </div>
              )}

              {/* Character map */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400 px-1">
                  {t("charMap")}
                </div>
                {results.slice(0, 20).map((occ, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${CHAR_COLORS[occ.char_code] || "bg-gray-500/80 text-white"}`}
                      >
                        U+{occ.char_code}
                      </span>
                      <span className="text-xs text-gray-600">
                        Line {occ.line_number}, Col {occ.position + 1}
                      </span>
                    </div>
                    {occ.context && (
                      <div className="text-xs text-gray-500 font-mono truncate">
                        ...{occ.context}...
                      </div>
                    )}
                  </div>
                ))}
                {results.length > 20 && (
                  <p className="text-center text-xs text-gray-600 py-2">
                    +{results.length - 20} more occurrences
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
