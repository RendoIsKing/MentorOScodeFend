// Lightweight analytics helper. Replace implementation with real telemetry later.
export function logEvent(name: string, props?: Record<string, any>) {
  try {
    // If a global dataLayer exists, push to it (e.g., GTM)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.dataLayer) {
      // @ts-ignore
      window.dataLayer.push({ event: name, ...props });
    } else if (typeof window !== 'undefined') {
      // Fallback: console for development visibility
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, props || {});
    }
  } catch {
    // ignore
  }
}


