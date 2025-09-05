"use client";
import { useEffect, useState } from "react";

export default function Reset() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      setDone(true);
    })();
  }, []);
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Reset web app cache</h1>
      <p className="mt-3 text-sm">{done ? "Done. Close this tab and re-open the app." : "Cleaning…"}</p>
    </main>
  );
}


