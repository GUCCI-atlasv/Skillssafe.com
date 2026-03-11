export const runtime = "edge";

import { useTranslations } from "next-intl";
import { Shield, Terminal, Zap, Globe } from "lucide-react";
import ScannerForm from "@/components/scanner/ScannerForm";
import OpenClawSection from "@/components/scanner/OpenClawSection";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {t("hero.badge")}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            <span className="text-green-400">Skills</span>Safe
          </h1>
          <p className="mt-2 text-xl font-semibold text-gray-300 sm:text-2xl">
            {t("hero.title")}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500">
            {t("hero.subtitle")}
          </p>

          {/* Platform badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-600">{t("hero.supportedBy")}:</span>
            {["OpenClaw", "Claude Code", "Cursor", "Codex"].map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs text-gray-400"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <ScannerForm />
      </section>

      {/* Feature highlights */}
      <section className="border-t border-gray-800 bg-gray-900/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "20+ Detection Rules",
                desc: "Credential theft, reverse shells, prompt injection & more",
                color: "text-green-400",
              },
              {
                icon: Zap,
                title: "< 100ms",
                desc: "Client-side scanning in your browser, instant results",
                color: "text-yellow-400",
              },
              {
                icon: Globe,
                title: "EN / 中文 / 日本語",
                desc: "The only trilingual AI skill scanner",
                color: "text-blue-400",
              },
              {
                icon: Terminal,
                title: "Free MCP Server",
                desc: "One-line setup for OpenClaw and any MCP-compatible agent",
                color: "text-purple-400",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <feat.icon className={`mb-3 h-6 w-6 ${feat.color}`} />
                <h3 className="font-semibold text-white">{feat.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OpenClaw Section */}
      <OpenClawSection />
    </div>
  );
}
