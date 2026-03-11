"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  code: string;
  lang?: string;
}

export default function IntegrateClient({ code, lang = "text" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <span className="text-xs text-gray-600">{lang}</span>
        <button
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="rounded p-1 text-gray-600 hover:text-gray-300 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}
