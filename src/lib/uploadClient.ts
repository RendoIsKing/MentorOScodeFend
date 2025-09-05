export async function uploadImage(file: File) {
  const base = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
  const endpoint = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_ENDPOINT || `${base}/v1/uploads/image`;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(endpoint, { method: "POST", credentials: "include", body: fd });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data?.message || `Upload failed ${res.status}`);
  return (data as any).url || (data as any).secure_url || (data as any).location;
}

export async function patchProfile(payload: Record<string, any>) {
  const base = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
  const res = await fetch(`${base}/v1/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data?.message || `Profile update failed ${res.status}`);
  return data;
}


