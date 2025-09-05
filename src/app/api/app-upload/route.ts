export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const path = process.env.NEXT_PUBLIC_UPLOAD_PATH || "/api/backend/v1/posts";
  const candidates = [
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN,
    "http://localhost:3006",
    "http://127.0.0.1:3006",
  ].filter(Boolean) as string[];
  const cookie = req.headers.get("cookie") ?? "";
  // If auth_token cookie exists, also forward it as Bearer to satisfy backend Auth fallback
  let bearer: string | undefined;
  try {
    const tokenPair = cookie
      .split(";")
      .map((s) => s.trim())
      .find((c) => c.startsWith("auth_token="));
    if (tokenPair) bearer = decodeURIComponent(tokenPair.split("=").slice(1).join("="));
  } catch {}

  let lastErr: any = null;
  for (const base of candidates) {
    try {
      const target = new URL(path, base).toString();
      const headers: Record<string, string> = { cookie };
      if (bearer && !req.headers.get("authorization")) {
        headers["authorization"] = `Bearer ${bearer}`;
      }
      const res = await fetch(target, { method: "POST", headers, body: form });
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "content-type": res.headers.get("content-type") || "text/plain" },
      });
    } catch (e) {
      lastErr = e;
    }
  }
  const message = `Cannot reach backend. Tried: ${candidates.join(", ")}. Last error: ${lastErr?.message || String(lastErr)}`;
  return new Response(message, { status: 502 });
}


