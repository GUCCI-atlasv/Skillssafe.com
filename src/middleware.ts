import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const LOCALES = ["en", "zh", "ja"] as const;
type Locale = (typeof LOCALES)[number];

// Cloudflare cf-ipcountry → locale mapping
const COUNTRY_LOCALE: Record<string, Locale> = {
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  JP: "ja",
};

const intlMiddleware = createMiddleware(routing);

function detectLocale(req: NextRequest): Locale {
  const country = req.headers.get("cf-ipcountry") ?? "";
  return COUNTRY_LOCALE[country] ?? "en";
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let API routes and static files pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/.well-known/") ||
    /\.(.+)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If path already has a valid locale prefix, hand off to next-intl
  const firstSegment = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(firstSegment)) {
    return intlMiddleware(req);
  }

  // Root path or unlocalised path → IP-based 302 redirect
  const locale = detectLocale(req);
  const target = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(new URL(target, req.url), 302);
}

export const config = {
  matcher: [
    // Match everything except _next internals and static files with extensions
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
