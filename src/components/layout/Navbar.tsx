"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Shield, Menu, X, Globe } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const navLinks = [
    { href: `/${locale}`, label: t("scanner") },
    { href: `/${locale}/zero-width-detector`, label: t("zeroWidth") },
    { href: `/${locale}/api-docs`, label: t("api") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-bold text-white hover:opacity-90"
          >
            <Shield className="h-6 w-6 text-green-400" />
            <span className="text-lg">
              Skills<span className="text-green-400">Safe</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                {LOCALES.find((l) => l.code === locale)?.label}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
                  {LOCALES.map((l) => (
                    <Link
                      key={l.code}
                      href={`/${l.code}${pathWithoutLocale}`}
                      className={`block px-4 py-2 text-sm hover:bg-gray-800 ${
                        l.code === locale
                          ? "text-green-400"
                          : "text-gray-300 hover:text-white"
                      }`}
                      onClick={() => setLangOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-800 bg-gray-950 md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-gray-400 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-800 pt-2">
              {LOCALES.map((l) => (
                <Link
                  key={l.code}
                  href={`/${l.code}${pathWithoutLocale}`}
                  className={`block py-2 text-sm ${
                    l.code === locale ? "text-green-400" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
