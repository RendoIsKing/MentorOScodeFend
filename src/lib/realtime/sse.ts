/* Lightweight SSE client with backoff, heartbeat, and visibility reconnect. */

type Handler = (payload: any) => void;

type EventMap = {
  'chat:message': Handler[];
  'chat:thread': Handler[];
  'chat:read': Handler[];
  'chat:thread:deleted': Handler[];
  'chat:resync': Handler[];
  'chat:hb': Handler[];
  '*': Handler[];
};

class RealtimeSseClient {
  private es: EventSource | null = null;
  private url: string;
  private withCredentials = true;
  private started = false;
  private lastConnectAttemptAt = 0;
  private cooldownUntilMs = 0;
  private backoffMs = 1000;
  private readonly maxBackoffMs = 30000;
  private lastHeartbeatAt = 0;
  private hbTimer: any = null;
  private handlers: EventMap = {
    'chat:message': [],
    'chat:thread': [],
    'chat:read': [],
    'chat:thread:deleted': [],
    'chat:resync': [],
    'chat:hb': [],
    '*': [],
  };

  constructor() {
    // Always use same-origin proxy so the stream path matches backend mount
    const base = '/api/backend/v1';
    this.url = `${base}/events/stream`;
  }

  on(evt: keyof EventMap, handler: Handler) {
    this.handlers[evt].push(handler);
    return () => {
      this.handlers[evt] = this.handlers[evt].filter((h) => h !== handler);
    };
  }

  private emit(evt: keyof EventMap, payload: any) {
    (this.handlers[evt] || []).forEach((h) => {
      try { h(payload); } catch {}
    });
    (this.handlers['*'] || []).forEach((h) => {
      try { h({ evt, payload }); } catch {}
    });
  }

  start() {
    if (this.started) return;
    // Only start in the foreground
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      const onVisible = () => {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', onVisible);
          this.start();
        }
      };
      document.addEventListener('visibilitychange', onVisible);
      return;
    }
    this.started = true;
    this.connect();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // Nudge reconnect on visibility regain
          if (!this.es || this.es.readyState === EventSource.CLOSED) {
            this.scheduleReconnect(0);
          }
          // Allow consumers to refetch
          try {
            const evt = new Event('student-snapshot-refresh');
            window.dispatchEvent(evt);
          } catch {}
        }
      });
      // Ensure the stream is closed when the page is unloading
      window.addEventListener('beforeunload', () => this.stop());
    }
  }

  stop() {
    this.started = false;
    if (this.es) {
      try { this.es.close(); } catch {}
      this.es = null;
    }
    if (this.hbTimer) {
      clearInterval(this.hbTimer);
      this.hbTimer = null;
    }
  }

  private connect() {
    try {
      // Respect any active cooldown (e.g., after a 429-style burst of quick failures)
      if (this.cooldownUntilMs && Date.now() < this.cooldownUntilMs) {
        this.scheduleReconnect(this.cooldownUntilMs - Date.now());
        return;
      }
      // Avoid duplicate connection attempts while an EventSource is CONNECTING/OPEN
      if (this.es && (this.es.readyState === EventSource.OPEN || this.es.readyState === EventSource.CONNECTING)) {
        return;
      }
      try { (window as any).__SENTRY__?.addBreadcrumb?.({ category: 'sse', message: 'connect', level: 'info' }); } catch {}
      this.lastConnectAttemptAt = Date.now();
      const es = new EventSource(this.url, { withCredentials: this.withCredentials } as any);
      this.es = es;
      this.backoffMs = 1000;
      this.lastHeartbeatAt = Date.now();
      // Heartbeat watchdog
      if (this.hbTimer) clearInterval(this.hbTimer);
      this.hbTimer = setInterval(() => {
        const now = Date.now();
        if (now - this.lastHeartbeatAt > 45000) {
          // stale stream, reconnect
          this.reconnect();
        }
      }, 10000);

      es.addEventListener('open', () => {
        this.lastHeartbeatAt = Date.now();
        try { (window as any).__SENTRY__?.addBreadcrumb?.({ category: 'sse', message: 'open', level: 'info' }); } catch {}
      });

      const bind = (name: keyof EventMap) => {
        es.addEventListener(name as string, (e: MessageEvent) => {
          this.lastHeartbeatAt = Date.now();
          let data: any = undefined;
          try { data = e.data ? JSON.parse(e.data) : undefined; } catch { data = e.data; }
          this.emit(name, data);
          if (name === 'chat:resync') {
            try { const ev = new Event('student-snapshot-refresh'); window.dispatchEvent(ev); } catch {}
          }
        });
      };
      (Object.keys(this.handlers) as (keyof EventMap)[]).forEach((k) => k !== '*' && bind(k));

      es.onerror = () => {
        try { (window as any).__SENTRY__?.addBreadcrumb?.({ category: 'sse', message: `error/backoff ${this.backoffMs}ms`, level: 'warning' }); } catch {}
        // If the stream fails very quickly after attempting to connect,
        // assume transient overload/rate-limit and jump to a safer backoff.
        const elapsed = Date.now() - this.lastConnectAttemptAt;
        if (elapsed < 2000) {
          // Enforce a minimum cooldown (match typical Retry-After ~11s)
          const minCooldown = 15000;
          this.backoffMs = Math.max(this.backoffMs, minCooldown);
          this.cooldownUntilMs = Date.now() + this.backoffMs;
        }
        this.reconnect();
      };
    } catch {
      this.reconnect();
    }
  }

  private reconnect() {
    if (!this.started) return;
    if (this.es) {
      try { this.es.close(); } catch {}
      this.es = null;
    }
    const wait = this.backoffMs + Math.floor(Math.random() * 400);
    this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
    this.scheduleReconnect(wait);
  }

  private scheduleReconnect(ms: number) {
    const delay = Math.max(
      0,
      Math.max(ms, this.cooldownUntilMs ? (this.cooldownUntilMs - Date.now()) : 0)
    );
    setTimeout(() => {
      if (!this.started) return;
      // Do not connect while hidden; wait until visible
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        const onVisible = () => {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onVisible);
            this.connect();
          }
        };
        document.addEventListener('visibilitychange', onVisible);
        return;
      }
      this.connect();
    }, delay);
  }
}

let singleton: RealtimeSseClient | null = null;
export function getRealtimeSse() {
  if (!singleton) singleton = new RealtimeSseClient();
  return singleton;
}

// Convenience auto-start on import in the browser (opt-in by calling ensureStarted)
export function ensureRealtimeStarted() {
  const s = getRealtimeSse();
  s.start();
  return s;
}


