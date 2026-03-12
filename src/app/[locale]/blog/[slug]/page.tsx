export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowLeft, Tag, Globe, Shield } from "lucide-react";
import { getPostBySlug } from "@/content/blog";
import type { SupportedLocale } from "@/content/blog";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const uiStrings = {
  en: {
    backToBlog: "← Back to Blog",
    publishedOn: "Published",
    by: "by",
    otherLanguages: "Also available in",
    ctaTitle: "Scan an AI Skill Now",
    ctaDesc:
      "Use SkillsSafe to check any SKILL.md, MCP config, or system_prompt for threats before installing.",
    ctaButton: "Open Free Scanner →",
    langNames: { en: "English", zh: "中文", ja: "日本語" },
  },
  zh: {
    backToBlog: "← 返回博客",
    publishedOn: "发布于",
    by: "作者",
    otherLanguages: "其他语言版本",
    ctaTitle: "立即扫描 AI 技能",
    ctaDesc:
      "使用 SkillsSafe 在安装前检查任何 SKILL.md、MCP 配置或 system_prompt 中的安全威胁。",
    ctaButton: "打开免费扫描器 →",
    langNames: { en: "English", zh: "中文", ja: "日本語" },
  },
  ja: {
    backToBlog: "← ブログに戻る",
    publishedOn: "公開日",
    by: "著者",
    otherLanguages: "他の言語で読む",
    ctaTitle: "AIスキルを今すぐスキャン",
    ctaDesc:
      "インストール前に、SkillsSafeでSKILL.md・MCP設定・system_promptの脅威を確認しましょう。",
    ctaButton: "無料スキャナーを開く →",
    langNames: { en: "English", zh: "中文", ja: "日本語" },
  },
} as const;

function formatDate(dateStr: string, locale: SupportedLocale): string {
  const date = new Date(dateStr);
  const localeMap = { en: "en-US", zh: "zh-CN", ja: "ja-JP" };
  return date.toLocaleDateString(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const safeLocale = (["en", "zh", "ja"].includes(locale) ? locale : "en") as SupportedLocale;
  const content = post[safeLocale];
  const BASE_URL = "https://skillssafe.com";

  return {
    title: `${content.title} | SkillsSafe Blog`,
    description: content.description,
    keywords: post.tags.join(", "),
    authors: [{ name: post.author }],
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
      languages: {
        en: `${BASE_URL}/en/blog/${slug}`,
        zh: `${BASE_URL}/zh/blog/${slug}`,
        ja: `${BASE_URL}/ja/blog/${slug}`,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      siteName: "SkillsSafe",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    other: {
      "article:published_time": post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const safeLocale = (["en", "zh", "ja"].includes(locale) ? locale : "en") as SupportedLocale;
  const ui = uiStrings[safeLocale];
  const content = post[safeLocale];
  const BASE_URL = "https://skillssafe.com";

  const otherLocales = (["en", "zh", "ja"] as SupportedLocale[]).filter(
    (l) => l !== safeLocale
  );

  return (
    <>
      {/* JSON-LD Article schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: content.title,
            description: content.description,
            author: { "@type": "Organization", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "SkillsSafe",
              url: BASE_URL,
            },
            datePublished: post.date,
            url: `${BASE_URL}/${safeLocale}/blog/${slug}`,
            keywords: post.tags.join(", "),
          }),
        }}
      />

      <div className="min-h-screen">
        {/* Back link */}
        <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
          <Link
            href={`/${safeLocale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ui.backToBlog}
          </Link>
        </div>

        {/* Article header */}
        <header className="mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6">
          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs text-green-400"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            {content.title}
          </h1>
          <p className="mt-3 text-lg text-gray-400 leading-relaxed">
            {content.description}
          </p>

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-800 pt-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {ui.publishedOn} {formatDate(post.date, safeLocale)}
            </span>
            <span>
              {ui.by} {post.author}
            </span>

            {/* Language switcher */}
            <div className="flex items-center gap-2 ml-auto">
              <Globe className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-gray-600 text-xs">{ui.otherLanguages}:</span>
              {otherLocales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}/blog/${slug}`}
                  className="text-xs text-gray-500 hover:text-green-400 transition-colors"
                >
                  {ui.langNames[l]}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Article content */}
        <article className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <BlogMarkdown content={content.content} />
        </article>

        {/* CTA section */}
        <section className="border-t border-gray-800 bg-gray-900/50">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center">
              <Shield className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <h2 className="text-2xl font-bold text-white">{ui.ctaTitle}</h2>
              <p className="mt-3 text-gray-400 max-w-xl mx-auto">{ui.ctaDesc}</p>
              <Link
                href={`/${safeLocale}`}
                className="mt-6 inline-flex items-center rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
              >
                {ui.ctaButton}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
