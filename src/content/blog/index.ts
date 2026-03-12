import type { BlogLocaleContent } from "./how-to-check-ai-skill-safety";
import howToCheckAiSkillSafety from "./how-to-check-ai-skill-safety";

export type { BlogLocaleContent };

export type BlogPostMeta = {
  slug: string;
  date: string;
  author: string;
  tags: string[];
  en: { title: string; description: string };
  zh: { title: string; description: string };
  ja: { title: string; description: string };
};

export type BlogPostFull = BlogPostMeta & {
  en: BlogLocaleContent;
  zh: BlogLocaleContent;
  ja: BlogLocaleContent;
};

export type SupportedLocale = "en" | "zh" | "ja";

export const allPosts: BlogPostFull[] = [howToCheckAiSkillSafety];

export function getPostBySlug(slug: string): BlogPostFull | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getPostsForLocale(_locale: SupportedLocale): BlogPostMeta[] {
  return allPosts.map(({ slug, date, author, tags, en, zh, ja }) => ({
    slug,
    date,
    author,
    tags,
    en: { title: en.title, description: en.description },
    zh: { title: zh.title, description: zh.description },
    ja: { title: ja.title, description: ja.description },
  }));
}

export function getAllSlugs(): string[] {
  return allPosts.map((p) => p.slug);
}
