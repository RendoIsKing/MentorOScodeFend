"use client";
import { useEffect } from 'react';
import { ensureRealtimeStarted, getRealtimeSse } from '@/lib/realtime/sse';

export default function RealtimeBootstrap() {
  useEffect(() => {
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const off1 = s.on('chat:message', () => {
      try { const ev = new Event('student-snapshot-refresh'); window.dispatchEvent(ev); } catch {}
    });
    const off2 = s.on('chat:thread', () => {
      try { const ev = new Event('student-snapshot-refresh'); window.dispatchEvent(ev); } catch {}
    });
    const off3 = s.on('chat:resync', () => {
      try { const ev = new Event('student-snapshot-refresh'); window.dispatchEvent(ev); } catch {}
    });
    return () => { off1(); off2(); off3(); };
  }, []);
  return null;
}


