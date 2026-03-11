import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { scanContent, type Lang } from "@/lib/scanner/engine";
import { saveReport } from "@/lib/db/reports";
import { checkRateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit";

export const runtime = "edge";

function getDB() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getRequestContext().env as any).DB ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";

  const rl = checkRateLimit(ip, 200);
  const rlHeaders = rateLimitHeaders(rl);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. 200 requests/hour.", code: 429 },
      { status: 429, headers: rlHeaders }
    );
  }

  let body: { content?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, lang = "en" } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Missing required field: content (string)" },
      { status: 400 }
    );
  }

  if (content.length > 500_000) {
    return NextResponse.json(
      { error: "Content too large. Maximum 500KB." },
      { status: 413 }
    );
  }

  const validLangs = ["en", "zh", "ja"];
  const scanLang: Lang = validLangs.includes(lang) ? (lang as Lang) : "en";
  const result = scanContent(content, scanLang);

  // Persist to D1 — must await; CF Workers kill unresolved promises on response
  await saveReport(result, undefined, getDB());

  return NextResponse.json(
    {
      decision: result.decision,
      score: result.score,
      risk_level: result.risk_level,
      threat_count: result.threat_count,
      top_threats: result.top_threats,
      zero_width_count: result.zero_width_count,
      scan_id: result.scan_id,
      scanned_at: result.scanned_at,
      lang: result.lang,
      recommendation: result.recommendation,
      report_url: `https://skillssafe.com/report/${result.scan_id}`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        ...rlHeaders,
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
