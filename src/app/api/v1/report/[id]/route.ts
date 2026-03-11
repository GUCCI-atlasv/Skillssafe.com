import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getReport } from "@/lib/db/reports";

export const runtime = "edge";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getDB() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getRequestContext().env as any).DB ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !id.startsWith("ss_")) {
    return NextResponse.json(
      { error: "Invalid scan ID format" },
      { status: 400, headers: CORS }
    );
  }

  const report = await getReport(id, getDB());

  if (!report) {
    return NextResponse.json(
      {
        error: "Report not found",
        hint: "Reports are stored for 30 days. Re-scan the skill to generate a new report.",
      },
      { status: 404, headers: CORS }
    );
  }

  return NextResponse.json(
    {
      scan_id: report.id,
      decision: report.decision,
      score: report.score,
      risk_level: report.risk_level,
      threat_count: report.threat_count,
      zero_width_count: report.zero_width_count,
      threats: JSON.parse(report.threats_json),
      recommendation: report.recommendation,
      lang: report.lang,
      source_url: report.source_url ?? null,
      content_length: report.content_length,
      scanned_at: report.scanned_at,
      report_url: `https://skillssafe.com/report/${report.id}`,
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}
