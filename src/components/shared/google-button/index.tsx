import React from "react";
import { GoogleLogin } from "@react-oauth/google";

type Props = {
  label?: string;
  mode?: "signin" | "signup";
};

const GoogleButton: React.FC<Props> = ({ label = "Continue with Google", mode = "signin" }) => {
  // Hide button entirely if client ID is not configured in this environment
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
  return (
    <div className="flex items-center justify-center pt-2">
      <div className="w-full flex justify-center">
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
            try {
              const idToken = cred.credential;
              if (!idToken) return;
              const res = await fetch(`${apiBase}/v1/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
              });
              const body = await res.json();
              if (!res.ok) throw new Error(body?.message || "Google login failed");
              // Consumers should read cookie or redux via me endpoint afterwards
              window.location.href = "/home";
            } catch (e) {
              console.error(e);
              alert("Google login failed");
            }
          }}
          onError={() => alert("Google auth cancelled")}
        />
      </div>
    </div>
  );
};

export default GoogleButton;
