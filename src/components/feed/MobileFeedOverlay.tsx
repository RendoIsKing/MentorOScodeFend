'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function MobileFeedOverlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="
        fixed inset-x-0 top-0
        bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h))]
        z-10 bg-black
      "
    >
      {children}
    </div>,
    document.body
  );
}


