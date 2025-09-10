import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:3006';
  const body = await req.json().catch(()=>null);
  if (!body) return NextResponse.json({ message: 'invalid json' }, { status: 400 });
  const cookie = req.headers.get('cookie') || '';
  const auth = req.headers.get('authorization') || '';
  const res = await fetch(`${backend}/api/backend/v1/post`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cookie': cookie, ...(auth ? { authorization: auth } : {}) },
    body: JSON.stringify(body),
    credentials: 'include' as any,
  });
  // Enforce returning postId to client if backend returns it
  let data: any = {};
  try { data = await res.json(); } catch { return new NextResponse(await res.text(), { status: res.status }); }
  return NextResponse.json(data, { status: res.status });
}

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


