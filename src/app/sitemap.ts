import type { MetadataRoute } from "next";
import { allPosts } from "@/content/blog";

const BASE_URL = "https://skillssafe.com";
const LOCALES = ["en", "zh", "ja"] as const;

interface PageConfig {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
}

const PAGES: PageConfig[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/zero-width-detector", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/integrate", priority: 0.8, changeFrequency: "weekly" },
  { path: "/api-docs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/feedback", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const url = `${BASE_URL}/${locale}${page.path}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
          ),
        },
      });
    }
  }

  // Blog post entries with hreflang
  for (const post of allPosts) {
    for (const locale of LOCALES) {
      const url = `${BASE_URL}/${locale}/blog/${post.slug}`;
      entries.push({
        url,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}/blog/${post.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
