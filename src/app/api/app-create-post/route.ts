import { NextRequest, NextResponse } from 'next/server';

export const runtime = "nodejs";

// Single handler: forward to canonical plural backend path
export async function POST(req: NextRequest) {
  try {
    // Prefer FE proxy when backend origin is not configured
    const feOrigin = req.nextUrl.origin;
    const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    const target = backend
      ? new URL('/api/backend/v1/post/posts', backend).toString()
      : new URL('/api/backend/v1/post/posts', feOrigin).toString();
    const cookie = req.headers.get('cookie') || '';
    const auth = req.headers.get('authorization') || '';
    const bodyText = await req.text();

    const headers: Record<string, string> = { 'content-type': req.headers.get('content-type') || 'application/json', cookie };
    if (!auth) {
      // Try to forward auth_token cookie as Bearer if present
      try {
        const tokenPair = cookie.split(';').map(s=>s.trim()).find(c=>c.startsWith('auth_token='));
        if (tokenPair) headers['authorization'] = `Bearer ${decodeURIComponent(tokenPair.split('=')[1]||'')}`;
      } catch {}
    } else {
      headers['authorization'] = auth;
    }

    const res = await fetch(target, { method: 'POST', headers, body: bodyText, credentials: 'include' as any });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (e: any) {
    return NextResponse.json({ message: `Create post proxy error: ${e?.message || String(e)}` }, { status: 502 });
  }
}


