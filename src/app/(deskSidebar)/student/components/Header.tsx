"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logEvent } from '@/lib/analytics';

type Period = '7d' | '30d' | '90d' | 'ytd';

export default function Header({
  name,
  avatarUrl,
  onPeriodChange,
}: {
  name: string;
  avatarUrl?: string;
  onPeriodChange: (p: Period) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30d');

  // Load period from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p') as Period | null;
    if (p === '7d' || p === '30d' || p === '90d' || p === 'ytd') setPeriod(p);
  }, []);

  // Simulated header status shimmer
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('Du er foran planen denne uken – bra jobba!');
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Propagate period changes, persist to URL, and log
  useEffect(() => {
    onPeriodChange(period);
    const url = new URL(window.location.href);
    url.searchParams.set('p', period);
    window.history.replaceState({}, '', url.toString());
    logEvent('student_center.period.changed', { period });
  }, [period]);

  return (
    <Card aria-label="Student header">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{name?.substring(0,2)?.toUpperCase() || 'ST'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base md:text-lg">{name}</CardTitle>
              {loading ? (
                <div className="h-4 w-52 animate-pulse rounded bg-muted" />
              ) : (
                <CardDescription>{status || 'Ingen status ennå – første innsjekk utløser en oppsummering'}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="Periodevelger">
            {(['7d','30d','90d','ytd'] as Period[]).map(p => (
              <Button key={p} variant={p===period? 'default':'outline'} size="sm" aria-pressed={p===period} onClick={() => setPeriod(p)}>
                {p.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0" />
    </Card>
  );
}


