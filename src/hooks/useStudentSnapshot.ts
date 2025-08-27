"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchStudentSnapshot } from "@/lib/api/student";

export function useStudentSnapshot(userId: string, initialPeriod: '7d' | '30d' | '90d' | 'ytd' = '30d') {
  const [period, setPeriod] = useState<typeof initialPeriod>(initialPeriod);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p = period) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentSnapshot(userId, p);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to load snapshot');
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => { load(period); }, [load, period]);

  const refresh = useCallback(() => load(period), [load, period]);

  return { period, setPeriod, data, loading, error, refresh } as const;
}


