/**
 * SkillsSafe MCP Server — SSE Transport
 *
 * Implements Model Context Protocol (MCP) over Server-Sent Events.
 * Compatible with OpenClaw, Claude Code, Cursor, Codex, and any MCP client.
 *
 * Add to OpenClaw: openclaw mcp add skillssafe https://skillssafe.com/api/mcp
 * Manual config: { "mcpServers": { "skillssafe": { "url": "https://skillssafe.com/api/mcp" } } }
 */

import { NextRequest, NextResponse } from "next/server";
import { scanContent, type Lang } from "@/lib/scanner/engine";

export const runtime = "edge";

// MCP Protocol types
interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const SERVER_INFO = {
  name: "skillssafe",
  version: "1.0.0",
};

const CAPABILITIES = {
  tools: {},
};

const TOOLS = [
  {
    name: "scan_skill",
    description:
      "Scan an AI skill file for security threats before installation. Returns INSTALL/REVIEW/BLOCK decision with threat details.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the skill file to scan (ClawHub URL, GitHub raw URL, etc.)",
        },
        content: {
          type: "string",
          description: "Direct content of the skill file to scan (SKILL.md, system_prompt, MCP config)",
        },
        lang: {
          type: "string",
          enum: ["en", "zh", "ja"],
          description: "Language for threat descriptions (default: en)",
        },
      },
      anyOf: [{ required: ["url"] }, { required: ["content"] }],
    },
  },
  {
    name: "get_report",
    description: "Get a brief summary for a scan ID. Full reports available at skillssafe.com/report/{scan_id}",
    inputSchema: {
      type: "object",
      properties: {
        scan_id: {
          type: "string",
          description: "The scan ID returned from scan_skill",
        },
      },
      required: ["scan_id"],
    },
  },
];

const RATE_LIMIT = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const limit = 60;
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now > entry.reset) {
    RATE_LIMIT.set(ip, { count: 1, reset: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function makeError(id: string | number | null, code: number, message: string): MCPResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function makeResult(id: string | number | null, result: unknown): MCPResponse {
  return { jsonrpc: "2.0", id, result };
}

async function handleMethod(req: MCPRequest, lang: Lang): Promise<MCPResponse> {
  const { id, method, params = {} } = req;

  switch (method) {
    case "initialize":
      return makeResult(id, {
        protocolVersion: "2024-11-05",
        serverInfo: SERVER_INFO,
        capabilities: CAPABILITIES,
      });

    case "notifications/initialized":
      return makeResult(id, {});

    case "tools/list":
      return makeResult(id, { tools: TOOLS });

    case "tools/call": {
      const toolName = params.name as string;
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const callLang: Lang = (["en", "zh", "ja"].includes(args.lang as string)
        ? args.lang
        : lang) as Lang;

      if (toolName === "scan_skill") {
        let textToScan: string | null = null;
        let sourceUrl: string | undefined;

        if (args.url) {
          sourceUrl = args.url as string;
          try {
            const res = await fetch(sourceUrl, {
              headers: { "User-Agent": "SkillsSafe-MCP/1.0" },
              signal: AbortSignal.timeout(8000),
            });
            if (!res.ok) {
              return makeError(id, -32603, `Failed to fetch URL: HTTP ${res.status}`);
            }
            textToScan = await res.text();
            if (textToScan.length > 200_000) textToScan = textToScan.slice(0, 200_000);
          } catch (e) {
            return makeError(id, -32603, `URL fetch failed: ${e instanceof Error ? e.message : "Unknown error"}`);
          }
        } else if (args.content) {
          textToScan = args.content as string;
          if (textToScan.length > 200_000) textToScan = textToScan.slice(0, 200_000);
        } else {
          return makeError(id, -32602, "Either 'url' or 'content' is required");
        }

        const result = scanContent(textToScan, callLang);

        const decisionEmoji =
          result.decision === "INSTALL" ? "✅" : result.decision === "REVIEW" ? "⚠️" : "🚫";

        const summaryLines = [
          `${decisionEmoji} **${result.decision}** — Risk Score: ${result.score}/100`,
          `Threats detected: ${result.threat_count}`,
          result.zero_width_count > 0
            ? `Hidden Unicode chars: ${result.zero_width_count}`
            : null,
          result.recommendation,
          "",
          result.top_threats.length > 0 ? "**Top threats:**" : null,
          ...result.top_threats.map((t) => `• ${t}`),
          "",
          sourceUrl ? `Source: ${sourceUrl}` : null,
          `Report: https://skillssafe.com/report/${result.scan_id}`,
          `Scan ID: ${result.scan_id}`,
        ]
          .filter(Boolean)
          .join("\n");

        return makeResult(id, {
          content: [
            {
              type: "text",
              text: summaryLines,
            },
          ],
          isError: result.decision === "BLOCK",
          _meta: {
            decision: result.decision,
            score: result.score,
            risk_level: result.risk_level,
            threat_count: result.threat_count,
            zero_width_count: result.zero_width_count,
            scan_id: result.scan_id,
            report_url: `https://skillssafe.com/report/${result.scan_id}`,
            threats: result.threats,
          },
        });
      }

      if (toolName === "get_report") {
        const scanId = args.scan_id as string;
        if (!scanId) {
          return makeError(id, -32602, "scan_id is required");
        }
        return makeResult(id, {
          content: [
            {
              type: "text",
              text: `Full report available at: https://skillssafe.com/report/${scanId}\n\nNote: Report persistence will be added in v1.0. Use scan_skill to re-scan for now.`,
            },
          ],
        });
      }

      return makeError(id, -32601, `Unknown tool: ${toolName}`);
    }

    case "ping":
      return makeResult(id, {});

    default:
      return makeError(id, -32601, `Method not found: ${method}`);
  }
}

// ── SSE Transport (GET) ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return new NextResponse("Rate limit exceeded: 60 req/hour", { status: 429 });
  }

  const encoder = new TextEncoder();
  let closed = false;
  let sessionId: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      sessionId = crypto.randomUUID();

      const sendEvent = (event: string, data: unknown) => {
        if (closed) return;
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      sendEvent("endpoint", {
        uri: `/api/mcp/message?session=${sessionId}`,
      });

      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept-Language",
      "X-Accel-Buffering": "no",
    },
  });
}

// ── HTTP Transport (POST) — handles both direct JSON-RPC and SSE sessions ──
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Rate limit exceeded: 60 req/hour" } },
      { status: 429 }
    );
  }

  const acceptLang = req.headers.get("accept-language") || "en";
  const lang: Lang = acceptLang.startsWith("zh")
    ? "zh"
    : acceptLang.startsWith("ja")
      ? "ja"
      : "en";

  let body: MCPRequest | MCPRequest[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(makeError(null, -32700, "Parse error: invalid JSON"), {
      status: 400,
    });
  }

  const requests = Array.isArray(body) ? body : [body];
  const responses = await Promise.all(
    requests.map((r) => handleMethod(r, lang))
  );

  const result = Array.isArray(body) ? responses : responses[0];

  return NextResponse.json(result, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept-Language",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept-Language",
    },
  });
}
