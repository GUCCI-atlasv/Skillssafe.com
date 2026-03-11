"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Shield, Mail, MessageSquareHeart } from "lucide-react";

const SUPPORT_EMAIL = "support@skillssafe.com";

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
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              {t("disclaimer")}
            </p>
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
              <li>
                <Link
                  href={`/${locale}/integrate`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("mcp")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-400">
              {t("support")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 hover:text-gray-300 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-gray-600" />
                  <span className="font-mono text-green-400/80 hover:text-green-400">
                    {SUPPORT_EMAIL}
                  </span>
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/feedback`}
                  className="inline-flex items-center gap-1.5 hover:text-gray-300 transition-colors"
                >
                  <MessageSquareHeart className="h-3.5 w-3.5 text-gray-600" />
                  {t("feedback")}
                </Link>
              </li>
              <li className="text-xs text-gray-700">{t("feedbackDesc")}</li>
            </ul>

            <h3 className="mb-3 mt-6 text-sm font-semibold text-gray-400">
              {t("legal")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Privacy%20Policy%20Inquiry`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Terms%20of%20Service%20Inquiry`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {t("terms")}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs text-gray-600">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
