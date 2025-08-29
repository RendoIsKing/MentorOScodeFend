"use client";
// TEST-ONLY SIGN-IN PAGE (not routed). Mirrors the real page but fixes base URL and cookie handling.
import React, { useState } from "react";

export default function SignInTestPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const isEmail = /@/.test(identifier);
      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password } as any;
      const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
      const res = await fetch(`${apiBase}/v1/auth/user-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Login failed (${res.status})`);
      setMsg("Logged in (cookie set). You can now navigate to /student");
    } catch (err: any) {
      setMsg(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Sign in (TEST)</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="border rounded px-3 py-2 hover:bg-muted">
          {loading ? "Signing in…" : "Sign in (test)"}
        </button>
      </form>
      {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
    </div>
  );
}


