export type ActionType =
  | "PLAN_SWAP_EXERCISE"
  | "PLAN_SET_DAYS_PER_WEEK"
  | "NUTRITION_SET_CALORIES"
  | "WEIGHT_LOG"
  | "WEIGHT_DELETE";

export type ActionEnvelope<T = any> = {
  type: ActionType;
  payload: T;
  userId: string;
  idemKey?: string;
  userFacingSummary?: string;
};

export async function applyAction<T = any>(env: ActionEnvelope<T>) {
  const base = (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER)
    ? `${(window as any).NEXT_PUBLIC_API_SERVER}`
    : (process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}` : "/api/backend");

  const res = await fetch(`${base}/v1/interaction/actions/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(env),
  });
  const json = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(json?.error || "Action failed");
  return json as { ok: boolean; summary?: string; deduped?: boolean; idemKey?: string };
}


