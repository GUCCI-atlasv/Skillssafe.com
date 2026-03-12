export type BlogLocaleContent = {
  title: string;
  description: string;
  content: string;
};

export type BlogPost = {
  slug: string;
  date: string;
  author: string;
  tags: string[];
  en: BlogLocaleContent;
  zh: BlogLocaleContent;
  ja: BlogLocaleContent;
};

const post: BlogPost = {
  slug: "how-to-check-ai-skill-safety",
  date: "2026-03-12",
  author: "SkillsSafe Team",
  tags: ["security", "guide", "openclaw", "skill-audit", "mcp"],
  en: {
    title: "How to Check If an AI Skill Is Safe: A 5-Step Guide",
    description:
      "Before installing any AI agent skill, follow these 5 steps to verify it's safe. Covers credential theft detection, zero-width character checks, and automated scanning with SkillsSafe.",
    content: `# How to Check If an AI Skill Is Safe: A 5-Step Guide

AI agent skills — whether from ClawHub, GitHub, or any community source — can contain hidden malicious code. Research shows that roughly 26% of agent skills have at least one vulnerability, and some malicious skills have accumulated over 30,000 installs before being discovered.

This guide walks you through 5 practical steps to verify any skill before installation.

## Step 1: Read the system_prompt Field

Every skill has a \`system_prompt\` (or equivalent instruction block). Open the SKILL.md file and carefully read what it instructs the agent to do.

**Red flags to look for:**
- References to sensitive files: \`~/.ssh/\`, \`~/.env\`, \`config.json\`, files containing "password" or "token"
- External URLs: \`webhook.site\`, \`requestbin.com\`, or any unfamiliar domain
- Behavior overrides: "ignore previous instructions", "always remember", "from now on"
- Shell commands: \`exec()\`, \`system()\`, \`curl\`, \`wget\`, \`nc\`

If the skill claims to be a "code formatter" but its instructions mention reading SSH keys — that's a major red flag.

## Step 2: Check for Hidden Zero-Width Characters

This is the most overlooked attack vector. Zero-width characters (U+200B, U+200C, U+200D, U+FEFF) are invisible in text editors but can hide malicious instructions.

**How to check manually:**
\`\`\`bash
cat -v skill.md | grep -P '[\\x00-\\x08]'
\`\`\`

**Or use SkillsSafe's zero-width detector** at [skillssafe.com/en/zero-width-detector](https://skillssafe.com/en/zero-width-detector) — paste the content and instantly see if any hidden characters are embedded, with exact positions highlighted.

## Step 3: Verify the Author and Source

- Is the author a known developer or organization?
- Does the skill have a GitHub repository with commit history?
- How many installs does it have? (High installs don't guarantee safety — the ClawHub malicious skill had 30,000 installs)
- Are there reviews or security audit results?

Check if the skill has been scanned by security tools like [SkillsSafe](https://skillssafe.com), SkillShield, or ClawSecure.

## Step 4: Run an Automated Scan

Manual review is important but time-consuming. Use an automated scanner to catch patterns you might miss.

**With SkillsSafe (free, no signup):**

**Option A — Web scanner:**
Visit [skillssafe.com](https://skillssafe.com), paste the skill content or enter the URL, and get a risk report in seconds.

**Option B — MCP Server (for agents):**
\`\`\`bash
# OpenClaw
openclaw mcp add skillssafe https://mcp.skillssafe.com/sse

# Or add to any MCP config
{
  "mcpServers": {
    "skillssafe": {
      "url": "https://mcp.skillssafe.com/sse"
    }
  }
}
\`\`\`

Also available on [Smithery.ai](https://smithery.ai) — search for "skillssafe".

**Option C — REST API:**
\`\`\`bash
curl -X POST https://skillssafe.com/api/v1/scan/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://clawhub.ai/skills/my-skill/SKILL.md"}'
\`\`\`

The scanner checks for credential theft, data exfiltration, prompt injection, reverse shells, ClawHavoc indicators, and hidden characters.

## Step 5: Use Sandboxing

Even after scanning, run new skills in an isolated environment first:

- **Docker sandbox:** \`openclaw --sandbox=docker\`
- **Dedicated low-privilege user account:** Don't run agents as root/admin
- **Minimal workspace mounting:** Only mount the directories the skill actually needs

## Summary

| Step | What | Time |
|------|------|------|
| 1 | Read system_prompt | 2 min |
| 2 | Check zero-width characters | 30 sec |
| 3 | Verify author/source | 1 min |
| 4 | Run automated scan | 10 sec |
| 5 | Use sandboxing | Setup once |

The fastest path: paste the skill URL into [SkillsSafe](https://skillssafe.com) and get a risk score in seconds. If the score is below 50, don't install it.

---

*Published by [SkillsSafe](https://skillssafe.com) — Free AI agent skill security scanner. Supports OpenClaw, Claude Code, Cursor, and Codex.*`,
  },
  zh: {
    title: "如何检查 AI 技能是否安全：5 步完整指南",
    description:
      "安装 AI Agent 技能前，如何快速判断它是否安全？本文介绍 5 个实操步骤，涵盖凭证窃取检测、零宽字符检查和 SkillsSafe 自动扫描。",
    content: `# 如何检查 AI 技能是否安全：5 步完整指南

AI Agent 技能——无论来自 ClawHub、GitHub 还是其他社区来源——都可能包含隐藏的恶意代码。研究数据显示，约 26% 的 Agent 技能至少含一个安全漏洞，某些恶意技能在被发现前已被安装超过 3 万次。

这篇指南教你在安装任何技能前，用 5 个步骤快速验证它是否安全。

## 第 1 步：阅读 system_prompt 字段

每个技能都有 \`system_prompt\`（或等价的指令区块）。打开 SKILL.md 文件，仔细阅读它指示 Agent 做什么。

**危险信号：**
- 引用敏感文件：\`~/.ssh/\`、\`~/.env\`、\`config.json\`、含 "password" 或 "token" 的文件
- 外部 URL：\`webhook.site\`、\`requestbin.com\`，或任何你不认识的域名
- 行为覆盖：「忽略之前的指令」「永远记住」「从现在开始」
- Shell 命令：\`exec()\`、\`system()\`、\`curl\`、\`wget\`、\`nc\`

如果一个技能声称是「代码格式化工具」，但它的指令里提到读取 SSH 密钥——这就是明显的危险信号。

## 第 2 步：检查隐藏的零宽字符

这是最容易被忽略的攻击方式。零宽字符（U+200B、U+200C、U+200D、U+FEFF）在文本编辑器中完全不可见，但可以隐藏恶意指令。

**手动检查方法：**
\`\`\`bash
cat -v skill.md | grep -P '[\\x00-\\x08]'
\`\`\`

**或使用 SkillsSafe 零宽字符检测工具** [skillssafe.com/zh/zero-width-detector](https://skillssafe.com/zh/zero-width-detector)——粘贴内容后立即显示是否存在隐藏字符，并精确标注每个字符的位置。

## 第 3 步：验证作者和来源

- 作者是已知的开发者或组织吗？
- 技能有 GitHub 仓库和提交历史吗？
- 安装量有多少？（高安装量不代表安全——ClawHub 恶意技能有 3 万次安装）
- 有没有用户评价或安全审计结果？

可以查看技能是否已被 [SkillsSafe](https://skillssafe.com)、SkillShield 或 ClawSecure 等安全工具扫描过。

## 第 4 步：运行自动化扫描

手动审查很重要但费时。用自动扫描器可以捕捉你可能遗漏的恶意模式。

**使用 SkillsSafe（免费，无需注册）：**

**方式 A——网页扫描器：**
访问 [skillssafe.com](https://skillssafe.com)，粘贴技能内容或输入 URL，秒级获取安全报告。

**方式 B——MCP Server（给 Agent 用）：**
\`\`\`bash
# OpenClaw 一行配置
openclaw mcp add skillssafe https://mcp.skillssafe.com/sse

# 或手动添加到任何 MCP 配置
{
  "mcpServers": {
    "skillssafe": {
      "url": "https://mcp.skillssafe.com/sse"
    }
  }
}
\`\`\`

也可以在 [Smithery.ai](https://smithery.ai) 搜索 "skillssafe" 直接安装。

**方式 C——REST API：**
\`\`\`bash
curl -X POST https://skillssafe.com/api/v1/scan/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://clawhub.ai/skills/my-skill/SKILL.md"}'
\`\`\`

扫描器会检测凭证窃取、数据外传、提示注入、反向 Shell、ClawHavoc 恶意指标和隐藏字符。

## 第 5 步：使用沙箱隔离

即使扫描通过，首次运行新技能时也建议使用隔离环境：

- **Docker 沙箱：** \`openclaw --sandbox=docker\`
- **专用低权限账户：** 不要用管理员/root 运行 Agent
- **最小范围挂载：** 只挂载技能实际需要的目录

## 总结

| 步骤 | 内容 | 时间 |
|------|------|------|
| 1 | 阅读 system_prompt | 2 分钟 |
| 2 | 检查零宽字符 | 30 秒 |
| 3 | 验证作者/来源 | 1 分钟 |
| 4 | 运行自动扫描 | 10 秒 |
| 5 | 使用沙箱 | 一次性配置 |

最快路径：把技能 URL 粘贴到 [SkillsSafe](https://skillssafe.com)，秒级获取安全评分。如果评分低于 50，就不要安装。

---

*由 [SkillsSafe](https://skillssafe.com) 发布——免费 AI Agent 技能安全扫描器，支持 OpenClaw、Claude Code、Cursor 和 Codex。*`,
  },
  ja: {
    title: "AIスキルが安全かどうかを確認する方法：5ステップガイド",
    description:
      "AIエージェントスキルをインストールする前に、安全性を確認する5つの実践的なステップ。認証情報の窃取検出、ゼロ幅文字チェック、SkillsSafeによる自動スキャンを解説。",
    content: `# AIスキルが安全かどうかを確認する方法：5ステップガイド

AIエージェントスキル——ClawHub、GitHub、その他のコミュニティソースのいずれであっても——隠された悪意のあるコードが含まれている可能性があります。調査によると、エージェントスキルの約26%に少なくとも1つの脆弱性が存在し、一部の悪意あるスキルは発見されるまでに3万回以上インストールされていました。

このガイドでは、スキルをインストールする前に安全性を確認する5つのステップを紹介します。

## ステップ1：system_promptフィールドを確認する

すべてのスキルには\`system_prompt\`（または同等の指示ブロック）があります。SKILL.mdファイルを開き、エージェントに何をするよう指示しているかを注意深く読んでください。

**危険なサイン：**
- 機密ファイルへの参照：\`~/.ssh/\`、\`~/.env\`、\`config.json\`、"password"や"token"を含むファイル
- 外部URL：\`webhook.site\`、\`requestbin.com\`、見覚えのないドメイン
- 動作の上書き：「以前の指示を無視」「常に覚えておく」「今後は必ず」
- シェルコマンド：\`exec()\`、\`system()\`、\`curl\`、\`wget\`、\`nc\`

「コードフォーマッター」を名乗るスキルが、SSH鍵の読み取りに言及していたら——それは明らかな危険信号です。

## ステップ2：隠れたゼロ幅文字をチェックする

これは最も見落とされやすい攻撃ベクトルです。ゼロ幅文字（U+200B、U+200C、U+200D、U+FEFF）はテキストエディタでは完全に見えませんが、悪意ある指示を隠すことができます。

**手動チェック方法：**
\`\`\`bash
cat -v skill.md | grep -P '[\\x00-\\x08]'
\`\`\`

**またはSkillsSafeのゼロ幅文字検出ツール**を使用してください：[skillssafe.com/ja/zero-width-detector](https://skillssafe.com/ja/zero-width-detector)——テキストを貼り付けるだけで、隠された文字が即座に表示され、正確な位置がハイライトされます。

## ステップ3：作者とソースを確認する

- 作者は知られた開発者または組織ですか？
- スキルにはGitHubリポジトリとコミット履歴がありますか？
- インストール数はどのくらいですか？（多いからといって安全とは限りません）
- レビューやセキュリティ監査結果はありますか？

[SkillsSafe](https://skillssafe.com)、SkillShield、ClawSecureなどのセキュリティツールでスキャン済みかどうかを確認してください。

## ステップ4：自動スキャンを実行する

手動レビューは重要ですが時間がかかります。自動スキャナーを使って、見落としがちなパターンを検出しましょう。

**SkillsSafeを使用（無料、登録不要）：**

**方法A——Webスキャナー：**
[skillssafe.com](https://skillssafe.com)にアクセスし、スキルの内容を貼り付けるかURLを入力すると、数秒でセキュリティレポートが得られます。

**方法B——MCPサーバー（エージェント向け）：**
\`\`\`bash
# OpenClaw ワンライン設定
openclaw mcp add skillssafe https://mcp.skillssafe.com/sse

# または任意のMCP設定に追加
{
  "mcpServers": {
    "skillssafe": {
      "url": "https://mcp.skillssafe.com/sse"
    }
  }
}
\`\`\`

[Smithery.ai](https://smithery.ai)で"skillssafe"を検索して直接インストールすることもできます。

**方法C——REST API：**
\`\`\`bash
curl -X POST https://skillssafe.com/api/v1/scan/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://clawhub.ai/skills/my-skill/SKILL.md"}'
\`\`\`

スキャナーは認証情報の窃取、データ流出、プロンプトインジェクション、リバースシェル、ClawHavocインジケーター、隠し文字を検出します。

## ステップ5：サンドボックスを使用する

スキャンに合格しても、新しいスキルを初めて実行する際は隔離環境で行うことをお勧めします：

- **Dockerサンドボックス：** \`openclaw --sandbox=docker\`
- **専用の低権限ユーザーアカウント：** 管理者/rootでエージェントを実行しない
- **最小限のワークスペースマウント：** スキルが実際に必要なディレクトリのみをマウント

## まとめ

| ステップ | 内容 | 所要時間 |
|---------|------|---------|
| 1 | system_promptを読む | 2分 |
| 2 | ゼロ幅文字をチェック | 30秒 |
| 3 | 作者/ソースを確認 | 1分 |
| 4 | 自動スキャンを実行 | 10秒 |
| 5 | サンドボックスを使用 | 初回設定のみ |

最速の方法：スキルのURLを[SkillsSafe](https://skillssafe.com)に貼り付けて、数秒でセキュリティスコアを取得。スコアが50未満なら、インストールしないでください。

---

*[SkillsSafe](https://skillssafe.com)が公開——無料のAIエージェントスキルセキュリティスキャナー。OpenClaw、Claude Code、Cursor、Codexに対応。*`,
  },
};

export default post;
