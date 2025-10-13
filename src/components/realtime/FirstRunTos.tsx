"use client";
import { useEffect } from 'react';

export default function FirstRunTos() {
  useEffect(() => {
    try {
      const key = 'tos.accepted.v1.0';
      const has = typeof window !== 'undefined' ? window.localStorage.getItem(key) : '1';
      if (has) return;
      // Fire-and-forget acceptance on first run (MVP)
      const apiBase = (process.env.NEXT_PUBLIC_API_SERVER as string) ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1` : '/api/backend/v1';
      fetch(`${apiBase}/legal/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: '1.0' }),
      }).finally(() => {
        try { window.localStorage.setItem(key, '1'); } catch {}
      });
    } catch {}
  }, []);
  return null;
}


