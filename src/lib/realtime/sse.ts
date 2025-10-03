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
    const base = (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_API_SERVER as string))
      ? `${process.env.NEXT_PUBLIC_API_SERVER}/v1`
      : '/api/backend/v1';
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
        // Will reconnect with backoff
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
    setTimeout(() => {
      if (!this.started) return;
      this.connect();
    }, Math.max(0, ms));
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


