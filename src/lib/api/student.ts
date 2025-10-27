import type { StudentSnapshot, WeightEntry } from '@/lib/types/student';
import { store } from '@/redux/store';

// Always use same-origin proxy in production so cookies and paths match backend mount
const BASE = '/api/backend/v1';

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
  const json = await res.json();
  // Normalize both legacy payload and new materialized snapshot { ok, snapshot }
  if (json && json.ok && json.snapshot) {
    const snap = json.snapshot as any;
    const weightTrend = Array.isArray(snap.weightSeries)
      ? snap.weightSeries.map((p: any) => ({ date: p.t, kg: p.v }))
      : [];
    const currentNutritionPlan = snap.nutritionSummary
      ? [{
          date: new Date().toISOString().slice(0,10),
          meals: [],
          dailyTargets: {
            kcal: snap.nutritionSummary.kcal,
            protein: snap.nutritionSummary.protein,
            carbs: snap.nutritionSummary.carbs,
            fat: snap.nutritionSummary.fat,
          },
        }]
      : [];
    const normalized: StudentSnapshot = {
      weightTrend,
      currentTrainingPlan: [],
      currentNutritionPlan,
      planChanges: [],
      glance: {
        adherence7d: snap?.kpis?.adherence7d,
        lastCheckIn: snap?.kpis?.lastCheckIn,
      },
      topExercises: [],
    } as any;
    return normalized;
  }
  return json;
}

export async function fetchExerciseProgress(
  userId: string,
  exerciseSlug: string,
  period: '7d' | '30d' | '90d' | 'ytd'
) {
  const url = userId === 'me'
    ? `${BASE}/student/me/exercise-progress?period=${period}&exercise=${encodeURIComponent(exerciseSlug)}`
    : `${BASE}/student/${encodeURIComponent(userId)}/exercise-progress?period=${period}&exercise=${encodeURIComponent(exerciseSlug)}`;
  const res = await fetch(url, { credentials: 'include', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('Failed to load exercise progress');
  return res.json();
}

// Optional: allow updating a point for the selected exercise
export async function updateExerciseProgress(
  userId: string,
  exerciseSlug: string,
  entry: { date: string; value: number }
) {
  const url = userId === 'me'
    ? `${BASE}/student/me/exercise-progress`
    : `${BASE}/student/${encodeURIComponent(userId)}/exercise-progress`;
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ exercise: exerciseSlug, ...entry }),
  });
  if (!res.ok) throw new Error('Failed to update exercise progress');
  return res.json();
}

export async function addExerciseProgress(
  userId: string,
  exerciseSlug: string,
  entry: { date: string; value: number }
) {
  const url = userId === 'me'
    ? `${BASE}/student/me/exercise-progress`
    : `${BASE}/student/${encodeURIComponent(userId)}/exercise-progress`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ exercise: exerciseSlug, ...entry }),
  });
  if (!res.ok) throw new Error('Failed to add exercise progress');
  return res.json();
}

export async function deleteExerciseProgress(
  userId: string,
  exerciseSlug: string,
  date: string
) {
  const url = userId === 'me'
    ? `${BASE}/student/me/exercise-progress?exercise=${encodeURIComponent(exerciseSlug)}&date=${encodeURIComponent(date)}`
    : `${BASE}/student/${encodeURIComponent(userId)}/exercise-progress?exercise=${encodeURIComponent(exerciseSlug)}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { method: 'DELETE', credentials: 'include', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('Failed to delete exercise progress');
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

export async function fetchRecentChanges(
  userId: string,
  limit = 10
) {
  const id = userId === 'me' ? 'me' : encodeURIComponent(userId);
  const url = `${BASE}/student/${id}/changes?limit=${limit}`;
  const res = await fetch(url, { credentials: 'include', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('Failed to load changes');
  return res.json();
}


