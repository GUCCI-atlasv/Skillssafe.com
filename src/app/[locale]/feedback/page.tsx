export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MessageSquareHeart, Mail, Clock } from "lucide-react";
import FeedbackForm from "@/components/feedback/FeedbackForm";

const BASE_URL = "https://skillssafe.com";
const PAGE_PATH = "feedback";
const SUPPORT_EMAIL = "support@skillssafe.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
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

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });

  const formMessages = {
    typeLabel: t("typeLabel"),
    titleLabel: t("titleLabel"),
    titlePlaceholder: t("titlePlaceholder"),
    descLabel: t("descLabel"),
    descPlaceholder: t("descPlaceholder"),
    skillUrlLabel: t("skillUrlLabel"),
    skillUrlPlaceholder: t("skillUrlPlaceholder"),
    emailOptLabel: t("emailOptLabel"),
    emailOptPlaceholder: t("emailOptPlaceholder"),
    submit: t("submit"),
    submitNote: t("submitNote"),
    successTitle: t("successTitle"),
    successDesc: t("successDesc"),
    responseTime: t("responseTime"),
    emailAlt: t("emailAlt"),
    types: {
      bug: t("types.bug"),
      false_positive: t("types.false_positive"),
      feature: t("types.feature"),
      security: t("types.security"),
      other: t("types.other"),
    },
    typeDesc: {
      bug: t("typeDesc.bug"),
      false_positive: t("typeDesc.false_positive"),
      feature: t("typeDesc.feature"),
      security: t("typeDesc.security"),
      other: t("typeDesc.other"),
    },
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <MessageSquareHeart className="h-4 w-4" />
            {t("badge")}
          </div>
          <h1 className="text-4xl font-extrabold text-white">{t("title")}</h1>
          <p className="mt-3 text-lg text-gray-500">{t("subtitle")}</p>

          {/* Quick info bar */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="h-4 w-4 text-gray-600" />
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-mono text-green-400 hover:text-green-300 transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4 text-gray-600" />
              {t("responseTime")}
            </div>
          </div>
        </div>

        {/* Form */}
        <FeedbackForm messages={formMessages} />

      </div>
    </div>
  );
}
