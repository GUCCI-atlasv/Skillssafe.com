# SkillsSafe — AI Skill Security Scanner

[![smithery badge](https://smithery.ai/badge/gucci/SkillsSafe)](https://smithery.ai/servers/gucci/SkillsSafe)

**Free, no-signup security scanner for AI agent skills.**
Scan any `SKILL.md`, MCP config, or `system_prompt` for threats before installing.

🌐 **[skillssafe.com](https://skillssafe.com)**

---

## What Is SkillsSafe?

As AI agents become more powerful, malicious skills can steal credentials, exfiltrate data, or hijack your agent's behavior. SkillsSafe scans skill files before you install them — the same way an antivirus scans software before you run it.

**Supported platforms:** OpenClaw · Claude Code · Cursor · Codex · any MCP-compatible agent

---

## Features

### 🔍 Security Scanner
Paste content, enter a URL, or upload a file to scan for:

| Threat | Description |
|---|---|
| **Credential Theft** | Attempts to access API keys, tokens, or passwords |
| **Data Exfiltration** | Skills that send your data to external servers |
| **Prompt Injection** | Hidden instructions that hijack agent behavior |
| **Shell Injection** | Reverse shell or arbitrary command execution |
| **Zero-Width Characters** | Invisible Unicode characters hiding malicious instructions |
| **Scope Creep** | Skills requesting permissions beyond their stated purpose |
| **Memory Poisoning** | Attempts to corrupt agent memory or context |
| **Privacy Risk** | Unnecessary access to personal or sensitive data |

Each scan returns a **risk score**, severity rating (SAFE / CAUTION / DANGER / CRITICAL), and a shareable report link.

### 👁️ Zero-Width Character Detector
Visualize invisible Unicode characters (`U+200B`, `U+200C`, `U+200D`, `U+FEFF`, etc.) hidden inside text. Attackers embed these to create prompts that look safe to humans but carry hidden instructions for AI agents.

### 🔌 MCP Server Integration
Native Model Context Protocol support — let your agent automatically check skill safety before installation. No API key required.

```bash
# OpenClaw (one-line setup)
openclaw mcp add https://skillssafe.com/api/mcp
```

**Available MCP tools:**
- `scan_url` — Scan a skill by URL
- `scan_content` — Scan skill content directly
- `get_report` — Retrieve a full scan report

### 📡 REST API
Works with any agent, script, or CI/CD pipeline.

```bash
# Scan by URL
curl -X POST https://skillssafe.com/api/v1/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://clawhub.ai/skills/example"}'

# Scan by content
curl -X POST https://skillssafe.com/api/v1/scan/content \
  -H "Content-Type: application/json" \
  -d '{"content": "...skill content..."}'
```

Full OpenAPI spec: `https://skillssafe.com/api/v1/openapi.json`

---

## Pages

| Route | Description |
|---|---|
| `/` | Main security scanner |
| `/zero-width-detector` | Hidden Unicode character detector |
| `/api-docs` | Interactive API documentation |
| `/integrate` | Integration guide for MCP & REST API |
| `/feedback` | Bug reports and feature requests |

---

## Getting Started (Local Development)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```bash
# .env.local
# (see wrangler.toml for Cloudflare Workers configuration)
```

### Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Database:** Cloudflare D1 (SQLite)
- **i18n:** next-intl (English · 中文 · 日本語)

---

## Pricing

**100% Free · No Signup · No Rate Limits for Humans**

API rate limit: 60 requests/hour (no API key required).

---

## Feedback & Support

Found a bug or false positive? [Send feedback](https://skillssafe.com/feedback) or email **support@skillssafe.com**.

---

*SkillsSafe is an independent security tool, not affiliated with Anthropic, OpenClaw, or Cisco.*
