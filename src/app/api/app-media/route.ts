import { NextRequest, NextResponse } from 'next/server';

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 200);
const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  const feOrigin = req.nextUrl.origin;
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ message: 'multipart/form-data required' }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ message: 'file required' }, { status: 400 });
  if (!(file.type === 'video/mp4' || file.type.startsWith('image/'))) {
    return NextResponse.json({ message: 'unsupported media type' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: `file too large (>${MAX_UPLOAD_MB}MB)` }, { status: 413 });
  }
  const fd = new FormData();
  fd.append('file', file);
  const cookie = req.headers.get('cookie') || '';
  const auth = req.headers.get('authorization') || '';
  const target = backendOrigin
    ? `${backendOrigin}/api/backend/v1/user/file-upload`
    : `${feOrigin}/api/backend/v1/user/file-upload`;
  const res = await fetch(target, {
    method: 'POST',
    body: fd,
    headers: { 'cookie': cookie, ...(auth ? { authorization: auth } : {}) },
    credentials: 'include' as any,
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
}

export const runtime = "nodejs";



