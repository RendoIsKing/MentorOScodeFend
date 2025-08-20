import type { StudentSnapshot, WeightEntry } from '@/lib/types/student';
import { store } from '@/redux/store';

const BASE = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_SERVER)
  ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1`
  : '/api/backend/v1';

function getAuthHeaders() {
  try {
    const token = store.getState().auth.token as string | undefined;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// TODO: Replace mocks with real API calls
export async function fetchStudentSnapshot(
  userId: string,
  period: '7d' | '30d' | '90d' | 'ytd' = '30d'
): Promise<StudentSnapshot> {
  const res = await fetch(`${BASE}/student/${encodeURIComponent(userId)}/snapshot?period=${period}`, {
    credentials: 'include',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to load student snapshot');
  return res.json();
}

export async function fetchExerciseProgress(
  userId: string,
  exerciseSlug: string,
  period: '7d' | '30d' | '90d' | 'ytd'
) {
  const url = `${BASE}/student/${encodeURIComponent(userId)}/exercise-progress?period=${period}&exercise=${encodeURIComponent(exerciseSlug)}`;
  const res = await fetch(url, { credentials: 'include', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('Failed to load exercise progress');
  return res.json();
}

export async function addWeightEntry(userId: string, entry: WeightEntry) {
  const res = await fetch(`${BASE}/student/${encodeURIComponent(userId)}/weights`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to add weight');
  return res.json();
}

export async function updateWeightEntry(userId: string, entry: WeightEntry) {
  const res = await fetch(`${BASE}/student/${encodeURIComponent(userId)}/weights`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to update weight');
  return res.json();
}

export async function deleteWeightEntry(userId: string, date: string) {
  const url = `${BASE}/student/${encodeURIComponent(userId)}/weights?date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { method: 'DELETE', credentials: 'include', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('Failed to delete weight');
  return res.json();
}


