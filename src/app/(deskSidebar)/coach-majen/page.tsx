"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoachMajenRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/room/Coach%20Majen');
  }, [router]);
  return null;
}


