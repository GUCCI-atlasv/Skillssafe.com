import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getPlatformStats } from "@/lib/db/reports";

export const runtime = "edge";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function getDB() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getRequestContext().env as any).DB ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const stats = await getPlatformStats(getDB());
  return NextResponse.json(
    {
      total_scans: stats.total_scans,
      total_threats_found: stats.total_threats_found,
      total_blocks: stats.total_blocks,
      rules_count: 60,
      languages_supported: ["en", "zh", "ja"],
      api_version: "v1",
      mcp_endpoint: "https://skillssafe.com/api/mcp",
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}
