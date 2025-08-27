const BASE = (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER)
  ? `${(window as any).NEXT_PUBLIC_API_SERVER}/v1/interaction`
  : (process.env.NEXT_PUBLIC_API_SERVER ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1/interaction` : '/api/backend/v1/interaction');

export type ChatHistoryItem = { role: 'user' | 'assistant'; content: string };

export async function chatCoachEngh(message: string, history: ChatHistoryItem[] = []) {
  const res = await fetch(`${BASE}/chat/engh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json() as Promise<{ reply?: string }>;
}

export async function decideAndApply(message: string, userId?: string) {
  const res = await fetch(`${BASE}/chat/engh/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, userId }),
  });
  if (!res.ok) throw new Error('Action failed');
  return res.json() as Promise<{ noAction?: boolean; actions?: any[]; summary?: string }>;
}

export async function fetchCurrentTraining() {
  const res = await fetch(`${BASE}/chat/engh/training/current`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch training');
  return res.json();
}

export async function fetchCurrentNutrition() {
  const res = await fetch(`${BASE}/chat/engh/nutrition/current`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch nutrition');
  return res.json();
}

export async function importTrainingFromText(text: string) {
  const res = await fetch(`${BASE}/chat/engh/training/import`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Import failed');
  return res.json();
}

export async function saveTrainingPlan(plan: any) {
  const res = await fetch(`${BASE}/chat/engh/training/save`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ plan })
  });
  if (!res.ok) throw new Error('Save training failed');
  return res.json();
}

export async function saveNutritionPlan(plan: any) {
  const res = await fetch(`${BASE}/chat/engh/nutrition/save`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ plan })
  });
  if (!res.ok) throw new Error('Save nutrition failed');
  return res.json();
}


