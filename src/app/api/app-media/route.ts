export const runtime = "nodejs";

export async function POST(req: Request) {
  const origin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:3006";
  // Use the existing backend file upload endpoint
  const path = "/api/backend/v1/user/file-upload";
  const target = new URL(path, origin).toString();
  const cookie = req.headers.get("cookie") ?? "";
  const form = await req.formData();
  try {
    const res = await fetch(target, { method: "POST", headers: { cookie }, body: form });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    return new Response(`Media proxy error: ${e?.message || String(e)}`, { status: 502 });
  }
}


