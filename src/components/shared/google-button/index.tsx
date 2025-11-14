import React, { useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

type Props = {
  label?: string;
  mode?: "signin" | "signup";
};

const GoogleButton: React.FC<Props> = ({ label = "Continue with Google", mode = "signin" }) => {
  // Always use same-origin proxy so auth cookies land on the web origin
  const apiBase = "/api/backend";
  const [busy, setBusy] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const disabled = busy || (cooldownUntil && Date.now() < cooldownUntil);
  const remainingSeconds = useMemo(() => {
    if (!cooldownUntil) return 0;
    const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return Math.max(0, left);
  }, [cooldownUntil, busy]);

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
            if (disabled) return;
            try {
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
                const waitMs = hdr ? (parseFloat(hdr) * 1000) : 15000;
                setCooldownUntil(Date.now() + (isFinite(waitMs) ? waitMs : 15000));
                alert(`Too many attempts. Please wait ${Math.ceil(((isFinite(waitMs) ? waitMs : 15000) / 1000))}s and try again.`);
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
