import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

type Props = {
  label?: string;
  mode?: "signin" | "signup";
};

const GoogleButton: React.FC<Props> = ({ label = "Continue with Google", mode = "signin" }) => {
  // Always use same-origin proxy so auth cookies land on the web origin
  const apiBase = "/api/backend";
  const [busy, setBusy] = useState(false);
  const inFlightRef = useRef(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const cooldownRef = useRef<number>(0);
  const backoffRef = useRef<number>(0);
  const disabled = busy || (cooldownUntil && Date.now() < cooldownUntil);
  const remainingSeconds = useMemo(() => {
    if (!cooldownUntil) return 0;
    const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return Math.max(0, left);
  }, [cooldownUntil, busy]);

  // Load any persisted cooldown (shared across tabs)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("google_auth_cooldown_until") : null;
      const ts = raw ? parseInt(raw, 10) : 0;
      const rawBackoff = typeof window !== "undefined" ? window.localStorage.getItem("google_auth_backoff_ms") : null;
      const backoffMs = rawBackoff ? parseInt(rawBackoff, 10) : 0;
      if (ts && ts > Date.now()) {
        setCooldownUntil(ts);
        cooldownRef.current = ts;
      }
      if (backoffMs && backoffMs > 0) {
        backoffRef.current = backoffMs;
      }
    } catch {}
  }, []);

  const startCooldown = (ms: number) => {
    const safety = 2000; // add buffer
    const until = Date.now() + Math.max(0, ms) + safety;
    setCooldownUntil(until);
    cooldownRef.current = until;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("google_auth_cooldown_until", String(until));
      }
    } catch {}
  };

  const updateBackoff = (serverMs?: number) => {
    // Minimum 60s window, exponential backoff up to 5 minutes
    const MIN_MS = 60000;
    const MAX_MS = 300000;
    const base = Math.max(serverMs || 0, MIN_MS);
    const prev = backoffRef.current || 0;
    const next = Math.min(Math.max(base, prev ? Math.min(prev * 2, MAX_MS) : base), MAX_MS);
    backoffRef.current = next;
    try {
      if (typeof window !== "undefined") window.localStorage.setItem("google_auth_backoff_ms", String(next));
    } catch {}
    return next;
  };

  // Hide button entirely if client ID is not configured in this environment
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex items-center justify-center pt-2">
      <div className="w-full flex justify-center relative">
        {/* Simple overlay to prevent repeated clicks while busy/cooldown */}
        {disabled && (
          <div
            className="absolute inset-0 z-10 cursor-not-allowed"
            style={{ pointerEvents: "auto", background: "transparent" }}
            aria-hidden="true"
          />
        )}
        <GoogleLogin
          // Force Google to show correct wording and centered large button
          text={mode === "signup" ? ("signup_with" as any) : ("signin_with" as any)}
          context={mode === "signup" ? ("signup" as any) : ("signin" as any)}
          shape={"rectangular" as any}
          theme={"outline" as any}
          size={"large" as any}
          logo_alignment={"left" as any}
          width={270 as any}
          onSuccess={async (cred) => {
            // Hard guard against duplicate callbacks (React strict/double fire)
            if (inFlightRef.current) return;
            // Respect persisted/global cooldown even if UI state hasn't caught up
            if (cooldownRef.current && Date.now() < cooldownRef.current) {
              const left = Math.ceil((cooldownRef.current - Date.now()) / 1000);
              alert(`Please wait ${left}s before trying again.`);
              return;
            }
            if (disabled) return;
            try {
              inFlightRef.current = true;
              setBusy(true);
              const idToken = cred.credential;
              if (!idToken) return;
              const res = await fetch(`${apiBase}/v1/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
              });
              // Try to parse JSON if available; fall back to text
              let body: any = null;
              try { body = await res.clone().json(); } catch { try { body = await res.text(); } catch {} }

              if (res.status === 429) {
                // Respect server Retry-After header when rate-limited
                const hdr = res.headers.get("retry-after");
                const retryMs = hdr ? (parseFloat(hdr) * 1000) : undefined;
                const waitMs = updateBackoff(isFinite(retryMs as any) ? (retryMs as number) : undefined);
                startCooldown(waitMs);
                const left = Math.ceil((waitMs + 2000) / 1000);
                alert(`Too many attempts. Please wait ${left}s and try again.`);
                return;
              }

              if (!res.ok) throw new Error((body && body.message) || "Google login failed");
              
              // Check if user needs onboarding (new Google user)
              const isNewUser = body?.isNewUser || false;
              
              // Clear any stale local/session state to avoid showing a previous user
              try {
                if (typeof document !== 'undefined') {
                  document.cookie = "onboarding=; Path=/; Max-Age=0; SameSite=None; Secure";
                }
                if (typeof localStorage !== 'undefined') {
                  localStorage.removeItem('student.ex');
                  localStorage.removeItem('student.p');
                  localStorage.removeItem('google_auth_backoff_ms');
                  localStorage.removeItem('google_auth_cooldown_until');
                }
                if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
              } catch {}

              // Use replace to avoid going back to the auth page
              if (isNewUser) {
                window.location.replace("/google-user-info?new=1");
              } else {
                window.location.replace("/home");
              }
            } catch (e) {
              console.error(e);
              alert("Google login failed");
            } finally {
              // Keep disabled until cooldown elapses if set; otherwise clear busy
              setBusy(false);
              inFlightRef.current = false;
            }
          }}
          onError={() => alert("Google auth cancelled")}
        />
        {/* Optional small cooldown badge */}
        {remainingSeconds > 0 && (
          <div className="absolute -bottom-6 text-xs text-muted-foreground select-none">
            Please wait {remainingSeconds}s…
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleButton;
