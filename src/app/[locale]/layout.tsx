export const runtime = "edge";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "../globals.css";

type Locale = "en" | "zh" | "ja";

const BASE_URL = "https://skillssafe.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const ogLocale =
    locale === "zh" ? "zh_CN" : locale === "ja" ? "ja_JP" : "en_US";

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
        ja: "/ja",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "SkillsSafe",
      locale: ogLocale,
      type: "website",
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "SkillsSafe — Free AI Skill Security Scanner",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${BASE_URL}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SkillsSafe",
  url: BASE_URL,
  description:
    "Free security scanner for AI agent skills. Detect credential theft, data exfiltration, prompt injection, and hidden Unicode characters in SKILL.md, MCP configs, and system prompts.",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  inLanguage: ["en", "zh", "ja"],
  featureList: [
    "AI Skill Security Scanning",
    "Zero-Width Character Detection",
    "Credential Theft Detection",
    "Data Exfiltration Detection",
    "Prompt Injection Detection",
    "MCP Config Security Audit",
    "OpenClaw Native Support",
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
