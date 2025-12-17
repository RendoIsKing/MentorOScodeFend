export type ConversationSummary = {
  id: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageAt?: string | null;
  unread?: number;
};

export type ConversationMessage = {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
  clientId?: string | null;
};

const API_BASE = "/api/backend/v1";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data as T;
}

export async function listConversations() {
  const r = await apiFetch<{ conversations: ConversationSummary[] }>("/conversations", { method: "GET" });
  return r.conversations || [];
}

export async function createConversation(partnerId: string) {
  const r = await apiFetch<{ conversationId: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({ partnerId }),
  });
  return r.conversationId;
}

export async function listConversationMessages(conversationId: string, cursor?: string | null) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const r = await apiFetch<{ messages: ConversationMessage[] }>(`/conversations/${encodeURIComponent(conversationId)}/messages${qs}`, { method: "GET" });
  return r.messages || [];
}

export async function sendConversationMessage(conversationId: string, text: string, clientId?: string) {
  const r = await apiFetch<{ ok: boolean; id: string }>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ text, clientId }),
  });
  return r;
}

export async function markConversationRead(conversationId: string) {
  return await apiFetch<{ ok: boolean }>(`/conversations/${encodeURIComponent(conversationId)}/read`, { method: "POST" });
}

export async function getUserById(userId: string) {
  // Note: backend user/:id is not authenticated in routes; keep include anyway for consistency.
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, { credentials: "include" });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new Error(data?.error?.message || data?.message || "Failed to load user");
  return data?.data ?? data;
}


