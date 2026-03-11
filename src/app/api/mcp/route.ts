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
  prompts: {},
};

const TOOLS = [
  {
    name: "scan_skill",
    description:
      "Scan an AI agent skill file (SKILL.md, MCP tool config, or system_prompt) for security threats before installation. Detects credential theft, data exfiltration, prompt injection, hidden zero-width characters, shell injection, reverse shells, memory poisoning, scope creep, and ClawHavoc malware indicators. Returns INSTALL/REVIEW/BLOCK decision with risk score 0–100. Free, no API key required. Supports OpenClaw, Claude Code, Cursor, and Codex skills.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "URL of the skill to scan. Accepts ClawHub URLs, GitHub raw URLs, or any HTTP-accessible SKILL.md / MCP config file.",
        },
        content: {
          type: "string",
          description:
            "Raw text content of the skill to scan. Use this when you have the skill content in memory (alternative to url).",
        },
        lang: {
          type: "string",
          enum: ["en", "zh", "ja"],
          default: "en",
          description:
            "Language for threat descriptions and recommendations in the response.",
        },
      },
      oneOf: [{ required: ["url"] }, { required: ["content"] }],
    },
  },
  {
    name: "get_report",
    description:
      "Retrieve a previously generated scan report by scan_id. Returns a link to the full report page at skillssafe.com.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      properties: {
        scan_id: {
          type: "string",
          description: "The scan ID (e.g. ss_a3f8c901_...) returned by scan_skill",
        },
      },
      required: ["scan_id"],
    },
  },
];

const PROMPTS = [
  {
    name: "scan_before_install",
    description:
      "Prompt template to scan an AI agent skill or MCP tool before installing it. Guides the model to use SkillsSafe to verify safety.",
    arguments: [
      {
        name: "skill_url",
        description: "The URL of the skill or MCP tool to inspect (e.g. a GitHub raw URL or ClawHub link).",
        required: true,
      },
    ],
  },
  {
    name: "review_skill_content",
    description:
      "Prompt template to review raw skill content pasted by the user and produce a security assessment.",
    arguments: [
      {
        name: "skill_content",
        description: "The raw text content of the skill file (SKILL.md, system_prompt, or MCP config).",
        required: true,
      },
    ],
  },
];

const PROMPT_MESSAGES: Record<string, (args: Record<string, string>) => unknown[]> = {
  scan_before_install: (args) => [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please scan the following AI agent skill for security threats before I install it:\n\n${args.skill_url}\n\nUse the scan_skill tool from SkillsSafe to check for credential theft, prompt injection, data exfiltration, hidden zero-width characters, and other risks. Then summarise whether it is safe to install.`,
      },
    },
  ],
  review_skill_content: (args) => [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please review the following AI agent skill content and assess its security:\n\n\`\`\`\n${args.skill_content}\n\`\`\`\n\nUse the scan_skill tool from SkillsSafe to analyse it for threats such as prompt injection, credential theft, data exfiltration, and hidden characters. Provide a clear INSTALL / REVIEW / BLOCK recommendation.`,
      },
    },
  ],
};

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
        protocolVersion: "2025-03-26",
        serverInfo: SERVER_INFO,
        capabilities: CAPABILITIES,
      });

    case "notifications/initialized":
      return makeResult(id, {});

    case "tools/list":
      return makeResult(id, { tools: TOOLS });

    case "prompts/list":
      return makeResult(id, { prompts: PROMPTS });

    case "prompts/get": {
      const promptName = (params.name as string) ?? "";
      const promptArgs = ((params.arguments ?? {}) as Record<string, string>);
      const messagesFn = PROMPT_MESSAGES[promptName];
      if (!messagesFn) {
        return makeError(id, -32602, `Unknown prompt: ${promptName}`);
      }
      const prompt = PROMPTS.find((p) => p.name === promptName)!;
      return makeResult(id, {
        description: prompt.description,
        messages: messagesFn(promptArgs),
      });
    }

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
