import { baseServerUrl } from "@/lib/utils";

export type MajenDmMessage = { id: string; sender: string; text: string; createdAt: string };

export async function ensureMajenThread(): Promise<string> {
  const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/thread`, { credentials: "include" });
  const j = await r.json().catch(() => ({}));
  const id = String((j as any)?.threadId || "");
  if (!r.ok || !id) throw new Error((j as any)?.message || "Failed to get Majen thread");
  return id;
}

export async function listMajenMessages(): Promise<MajenDmMessage[]> {
  const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/messages`, { credentials: "include" });
  const j = await r.json().catch(() => ({}));
  const raw = Array.isArray((j as any)?.messages) ? (j as any).messages : [];
  const list = raw.map((m: any) => ({
    id: String(m?._id || m?.id),
    sender: String(m?.sender || ""),
    text: String(m?.text || ""),
    createdAt: String(m?.createdAt || new Date().toISOString()),
  }));
  list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  return list;
}

export async function sendMajenMessage(text: string) {
  const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.message || "Failed to send message");
  return j;
}


