export const runtime = "edge";

const AUTH_CONTENT =
  "v=MCPv1; k=ed25519; p=ff2b+DbTvKdpBaWKpTCQ2+zM/NvszyRab/DZJDaApZo=";

export function GET() {
  return new Response(AUTH_CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
