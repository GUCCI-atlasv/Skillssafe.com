"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Shield } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="font-bold text-white">
                Skills<span className="text-green-400">Safe</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{t("tagline")}</p>
            <p className="mt-4 text-xs text-gray-600">{t("disclaimer")}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-400">
              {t("links")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href={`/${locale}`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("scanner")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/zero-width-detector`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("zeroWidth")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/api-docs`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("api")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Stats placeholder */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-400">
              Platform
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Scans", value: "0" },
                { label: "Rules", value: "20+" },
                { label: "Languages", value: "3" },
                { label: "Cost", value: "Free" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-gray-900 p-3 text-center"
                >
                  <div className="text-lg font-bold text-green-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-gray-500">{t("copyright")}</p>
          <p className="text-xs text-gray-700">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
