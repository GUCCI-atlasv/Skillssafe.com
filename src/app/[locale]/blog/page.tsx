export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import { getPostsForLocale } from "@/content/blog";
import type { SupportedLocale } from "@/content/blog";

type Props = {
  params: Promise<{ locale: string }>;
};

const blogMeta = {
  en: {
    title: "Blog — AI Skill Security Insights | SkillsSafe",
    description:
      "Security guides, threat analysis, and best practices for AI agent skill safety. Learn how to protect yourself from malicious skills.",
    heading: "Security Blog",
    subtitle: "Guides, threat analysis, and best practices for AI skill security",
    readMore: "Read article",
    publishedOn: "Published",
  },
  zh: {
    title: "博客 — AI 技能安全洞察 | SkillsSafe",
    description:
      "AI Agent 技能安全指南、威胁分析和最佳实践。了解如何保护自己免受恶意技能侵害。",
    heading: "安全博客",
    subtitle: "AI 技能安全指南、威胁分析与最佳实践",
    readMore: "阅读文章",
    publishedOn: "发布于",
  },
  ja: {
    title: "ブログ — AIスキルセキュリティ情報 | SkillsSafe",
    description:
      "AIエージェントスキルのセキュリティガイド、脅威分析、ベストプラクティス。悪意のあるスキルから身を守る方法を学びましょう。",
    heading: "セキュリティブログ",
    subtitle: "AIスキルセキュリティのガイド・脅威分析・ベストプラクティス",
    readMore: "記事を読む",
    publishedOn: "公開日",
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
  const { locale } = await params;
  const meta = blogMeta[locale as SupportedLocale] ?? blogMeta.en;
  const BASE_URL = "https://skillssafe.com";

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        en: `${BASE_URL}/en/blog`,
        zh: `${BASE_URL}/zh/blog`,
        ja: `${BASE_URL}/ja/blog`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/blog`,
      siteName: "SkillsSafe",
      type: "website",
    },
  };
}

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  const safeLocale = (["en", "zh", "ja"].includes(locale) ? locale : "en") as SupportedLocale;
  const meta = blogMeta[safeLocale];
  const posts = getPostsForLocale(safeLocale);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute top-10 right-1/4 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400">
            <BookOpen className="h-3.5 w-3.5" />
            Blog
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {meta.heading}
          </h1>
          <p className="mt-3 text-lg text-gray-400">{meta.subtitle}</p>
        </div>
      </section>

      {/* Post list */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {posts.map((post) => {
            const localeContent = post[safeLocale];
            return (
              <Link
                key={post.slug}
                href={`/${safeLocale}/blog/${post.slug}`}
                className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-gray-700 hover:bg-gray-800/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors leading-snug">
                      {localeContent.title}
                    </h2>
                    <p className="mt-2 text-gray-400 leading-relaxed line-clamp-2">
                      {localeContent.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {meta.publishedOn} {formatDate(post.date, safeLocale)}
                      </span>
                      <span>{post.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-sm text-green-400 group-hover:gap-2 transition-all">
                    {meta.readMore}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
