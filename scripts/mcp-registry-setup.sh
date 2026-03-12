#!/usr/bin/env bash
# SkillsSafe MCP Registry 提交脚本
# 作用：生成 HTTP 验证密钥，并完成 mcp-publisher 登录 + 发布
# 使用方法：bash scripts/mcp-registry-setup.sh

set -e

MY_DOMAIN="skillssafe.com"
KEY_FILE="key.pem"
AUTH_FILE="public/.well-known/mcp-registry-auth"

echo "=== Step 1: 生成 Ed25519 密钥对 ==="
openssl genpkey -algorithm Ed25519 -out "${KEY_FILE}"
echo "密钥已保存至 ${KEY_FILE}（请勿提交到 git！）"

echo ""
echo "=== Step 2: 生成 mcp-registry-auth 文件内容 ==="
PUBLIC_KEY="$(openssl pkey -in "${KEY_FILE}" -pubout -outform DER | tail -c 32 | base64)"
echo "v=MCPv1; k=ed25519; p=${PUBLIC_KEY}" > "${AUTH_FILE}"
echo "验证文件已写入 ${AUTH_FILE}"
echo "文件内容："
cat "${AUTH_FILE}"

echo ""
echo "=== Step 3: 请先部署到 Cloudflare，确保以下 URL 可访问 ==="
echo "https://${MY_DOMAIN}/.well-known/mcp-registry-auth"
echo ""
echo "验证命令：curl https://${MY_DOMAIN}/.well-known/mcp-registry-auth"
echo ""
read -p "部署完成后按 Enter 继续..."

echo ""
echo "=== Step 4: 安装 mcp-publisher ==="
if ! command -v mcp-publisher &> /dev/null; then
    echo "正在安装 mcp-publisher..."
    brew install mcp-publisher || curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
else
    echo "mcp-publisher 已安装：$(mcp-publisher --version 2>&1 | head -1)"
fi

echo ""
echo "=== Step 5: 使用 HTTP 验证登录 MCP Registry ==="
PRIVATE_KEY="$(openssl pkey -in "${KEY_FILE}" -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
mcp-publisher login http --domain "${MY_DOMAIN}" --private-key "${PRIVATE_KEY}"

echo ""
echo "=== Step 6: 发布到 MCP Registry ==="
mcp-publisher publish

echo ""
echo "=== 完成！验证发布结果 ==="
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.skillssafe" | python3 -m json.tool 2>/dev/null || echo "请手动检查：https://registry.modelcontextprotocol.io/v0.1/servers?search=com.skillssafe"

echo ""
echo "⚠️  安全提示：请将 ${KEY_FILE} 妥善保管，不要提交到 git！"
echo "   可以运行：echo 'key.pem' >> .gitignore"
