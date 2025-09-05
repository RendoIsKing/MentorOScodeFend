export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:3006";
    const target = new URL("/api/backend/v1/post", origin).toString();
    const cookie = req.headers.get("cookie") ?? "";
    const body = await req.text();

    // Try to forward auth_token as Bearer if present
    let bearer: string | undefined;
    try {
      const tokenPair = cookie
        .split(";")
        .map((s) => s.trim())
        .find((c) => c.startsWith("auth_token="));
      if (tokenPair) bearer = decodeURIComponent(tokenPair.split("=").slice(1).join("="));
    } catch {}

    const headers: Record<string, string> = {
      cookie,
      "content-type": req.headers.get("content-type") || "application/json",
    };
    if (bearer && !req.headers.get("authorization")) headers["authorization"] = `Bearer ${bearer}`;

    const res = await fetch(target, { method: "POST", headers, body });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return new Response(`Create post proxy error: ${e?.message || String(e)}`, { status: 502 });
  }
}


