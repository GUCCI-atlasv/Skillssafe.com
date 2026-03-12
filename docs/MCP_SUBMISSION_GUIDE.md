# MCP 服务器注册提交完整指南

> 基于 SkillsSafe 实战经验整理，适用于任何 MCP 服务器项目。

---

## 目录

1. [准备工作](#1-准备工作)
2. [官方 MCP Registry](#2-官方-mcp-registry)
3. [npm 包发布](#3-npm-包发布)
4. [Glama 提交](#4-glama-提交)
5. [awesome-mcp-servers PR](#5-awesome-mcp-servers-pr)
6. [Smithery](#6-smithery)
7. [验证与维护](#7-验证与维护)

---

## 1. 准备工作

### 1.1 `.well-known/mcp.json`（身份声明）

在你的网站根目录部署，供官方扫描器验证身份：

```json
{
  "mcpVersion": "1.0",
  "name": "your-server-name",
  "version": "1.0.0",
  "description": "Your server description.",
  "endpoints": [
    {
      "type": "sse",
      "url": "https://mcp.yourdomain.com/sse"
    }
  ],
  "capabilities": {
    "tools": true,
    "resources": false
  }
}
```

**部署路径：** `https://yourdomain.com/.well-known/mcp.json`

### 1.2 GitHub 仓库结构（npm 包）

```
your-mcp-server/
├── src/
│   └── index.ts          # TypeScript 入口（必须）
├── dist/                 # 构建输出
├── glama.json            # Glama 索引文件
├── package.json          # 含 mcpName 字段
├── tsconfig.json
├── LICENSE               # MIT 推荐
└── README.md
```

### 1.3 `package.json` 关键字段

```json
{
  "name": "your-mcp-package",
  "version": "1.0.0",
  "mcpName": "com.yourdomain/server-name",
  "license": "MIT",
  "type": "module",
  "bin": {
    "your-mcp-package": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  }
}
```

> ⚠️ `mcpName` 字段是官方 Registry 验证的关键，格式为 `com.yourdomain/name`。

### 1.4 `glama.json`

```json
{
  "$schema": "https://glama.ai/mcp/servers/schema.json",
  "name": "Your MCP Server Name",
  "description": "1-2句话描述，突出核心功能。",
  "homepage": "https://yourdomain.com",
  "categories": ["security"],
  "environment": []
}
```

---

## 2. 官方 MCP Registry

**地址：** https://registry.modelcontextprotocol.io  
**适用于：** 所有类型的 MCP 服务器（远程 SSE / npm 包）

### 2.1 安装 mcp-publisher

```bash
brew install mcp-publisher
# 或
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
```

### 2.2 创建 `server.json`

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "com.yourdomain/server-name",
  "title": "Your Server Display Name",
  "description": "最多100字符的描述。",
  "version": "1.0.0",
  "repository": {
    "url": "https://github.com/yourusername/your-repo",
    "source": "github"
  },
  "remotes": [
    {
      "type": "sse",
      "url": "https://mcp.yourdomain.com/sse"
    }
  ],
  "packages": [
    {
      "registryType": "npm",
      "identifier": "your-mcp-package",
      "version": "1.0.0",
      "transport": {
        "type": "stdio"
      }
    }
  ]
}
```

### 2.3 HTTP 域名验证登录

```bash
# 第一步：生成密钥对
openssl genpkey -algorithm Ed25519 -out key.pem

# 第二步：生成验证文件内容
PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
echo "v=MCPv1; k=ed25519; p=${PUBLIC_KEY}" > public/.well-known/mcp-registry-auth
```

将 `mcp-registry-auth` 部署到 `https://yourdomain.com/.well-known/mcp-registry-auth`，然后：

```bash
# 第三步：登录
PRIVATE_KEY="$(openssl pkey -in key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
mcp-publisher login http --domain yourdomain.com --private-key "$PRIVATE_KEY"

# 第四步：发布
mcp-publisher publish
```

### 2.4 验证

```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.yourdomain"
```

> ⚠️ **注意事项：**
> - `description` 最多 100 字符，超出会报 422 错误
> - 同一版本号不能重复发布，需升级版本号
> - Token 有效期较短，发布前需重新登录
> - `key.pem` 加入 `.gitignore`，不要提交到 git

---

## 3. npm 包发布

**适用于：** 希望用户通过 `npx` 直接使用的 MCP 服务器

### 3.1 注册 npm 账号

前往 https://www.npmjs.com/signup 注册账号。

### 3.2 生成 Automation Token

1. 登录 npm → Settings → Access Tokens
2. **Generate New Token → Classic Token → Automation**（此类型可绕过 2FA 要求）
3. 复制 token

```bash
npm set //registry.npmjs.org/:_authToken=你的token
```

### 3.3 构建并发布

```bash
npm install
npm run build
npm publish --access public
```

### 3.4 验证

```bash
npx your-mcp-package --help
# 或查看 npm 页面
open https://www.npmjs.com/package/your-mcp-package
```

---

## 4. Glama 提交

**地址：** https://glama.ai/mcp/servers  
**作用：** awesome-mcp-servers PR 要求有 Glama A/A/A 评分才能被合并

### 4.1 登录

使用 GitHub 账号直接登录（免费），不需要付款。

### 4.2 提交服务器

1. 点击右上角 **Add Server**
2. 填写：
   - **Name**：你的 npm 包名（如 `skillssafe-mcp`）
   - **Description**：1-2句功能描述
   - **GitHub Repository URL**：`https://github.com/yourusername/your-repo`
3. 点击 **Submit for Review**

### 4.3 获得 A/A/A 评分的条件

| 评分项 | 要求 |
|--------|------|
| **Security A** | `npm audit` 无高危漏洞 |
| **License A** | 有 MIT / Apache 等主流开源协议 |
| **Quality A** | TypeScript、有 `tsconfig.json`、可正常安装运行 |

> 审核通常需要几小时至1天。

### 4.4 获得 Glama 链接后

在 awesome-mcp-servers 的 README 条目里加入：

```markdown
- [yourusername/your-repo](https://github.com/yourusername/your-repo) [glama](https://glama.ai/mcp/servers/yourusername/your-repo) 📇 ☁️ - Your description.
```

---

## 5. awesome-mcp-servers PR

**地址：** https://github.com/punkpeye/awesome-mcp-servers  
**要求：** 必须先有 Glama 列表 + A/A/A 评分

### 5.1 Fork 仓库

在 GitHub 上 Fork `punkpeye/awesome-mcp-servers`。

### 5.2 克隆并编辑

```bash
git clone https://github.com/yourusername/awesome-mcp-servers.git
cd awesome-mcp-servers
```

在 `README.md` 找到对应分类（如 `### 🔒 Security`），按字母顺序插入：

```markdown
- [yourusername/your-repo](https://github.com/yourusername/your-repo) [glama](https://glama.ai/mcp/servers/yourusername/your-repo) 📇 ☁️ - Your description here.
```

### 5.3 Emoji 图例

| Emoji | 含义 |
|-------|------|
| `📇` | TypeScript/JavaScript |
| `🐍` | Python |
| `🏎️` | Go |
| `🦀` | Rust |
| `☁️` | 云服务（远程 API） |
| `🏠` | 本地服务 |
| `🍎` | macOS |
| `🪟` | Windows |
| `🐧` | Linux |

### 5.4 提交 PR

```bash
git add README.md
git commit -m "Add your-server-name - brief description"
git push origin main
```

在 GitHub 上创建 PR，目标仓库为 `punkpeye/awesome-mcp-servers:main`。

**PR 描述模板：**

```
Add [Your Server Name] to the [Category] section.

- Free / Open source
- GitHub: https://github.com/yourusername/your-repo
- npm: https://www.npmjs.com/package/your-package
- Glama: https://glama.ai/mcp/servers/yourusername/your-repo
- MCP Registry: com.yourdomain/server-name
```

> ⚠️ **常见 Bot 检查失败原因：**
> - `missing-glama`：缺少 Glama 链接，需先提交到 Glama
> - `non-github-url`：链接必须是 `https://github.com/...` 格式
> - `duplicate`：仓库链接在列表中已存在

---

## 6. Smithery

**地址：** https://smithery.ai  
**提交方式：** 提供 GitHub 仓库 URL 即可，自动索引。

---

## 7. 验证与维护

### 7.1 上线后检查清单

```bash
# 官方 Registry
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.yourdomain"

# .well-known 文件
curl https://yourdomain.com/.well-known/mcp.json
curl https://yourdomain.com/.well-known/mcp-registry-auth

# npm 包可用性
npx your-mcp-package --help
```

### 7.2 版本更新流程

1. 更新 `package.json` 版本号
2. `npm publish --access public`
3. 更新 `server.json` 版本号
4. 重新登录并 `mcp-publisher publish`

### 7.3 安全注意事项

- `key.pem` 加入 `.gitignore`，永不提交
- npm Automation Token 妥善保管
- 定期 `npm audit` 检查依赖漏洞

---

## 提交平台一览

| 平台 | 覆盖范围 | 难度 | 时间 |
|------|---------|------|------|
| 官方 MCP Registry | Anthropic 生态 | ★★★ | 30分钟 |
| npm | 所有开发者 | ★★ | 15分钟 |
| Glama | awesome-mcp-servers 必须项 | ★★ | 1天（审核） |
| awesome-mcp-servers | 最大曝光 | ★★★ | 数天（PR审核） |
| Smithery | AI 工具目录 | ★ | 即时 |

---

*整理自 SkillsSafe MCP 服务器注册实战 · 2026年3月*
