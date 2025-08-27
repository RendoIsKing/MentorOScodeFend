"use client";
import React, { useEffect, useState } from "react";
import PlanPreviewCard from "./PlanPreviewCard";

type Msg = { role: "coach" | "user"; text: string };
const askMore = "Hva veier du ca. nå, og hvor mange dager i uken ønsker du å trene?";

export default function Conversation() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [collected, setCollected] = useState(0);
  const [preview, setPreview] = useState<any>(null);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/backend/v1/preonboarding/start", { method: "POST" });
      const data = await res.json();
      setMsgs([{ role: "coach", text: data.firstMessage }]);
    })();
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMsgs(m => [...m, { role: "user", text: userText }]);
    setInput("");

    const patch: any = {};
    if (/vekt|kg/i.test(userText)) {
      const m = userText.match(/(\d{2,3})\s?kg/i);
      if (m) patch.bodyWeightKg = Number(m[1]);
    }
    if (/begynner|ny/i.test(userText)) patch.experienceLevel = "beginner";
    if (/skade|kne/i.test(userText)) patch.injuries = ["knee"];
    if (/mål|ned i vekt|cut/i.test(userText)) patch.goals = "cut";
    if (/vegan/i.test(userText)) patch.diet = "vegan";
    if (/dager/i.test(userText)) {
      const m = userText.match(/(\d)\s*dager?/i);
      if (m) patch.schedule = { daysPerWeek: Number(m[1]) };
    }

    if (patch.injuries && !consented) {
      setMsgs(m => [...m, { role: "coach", text: "For å lagre informasjon om skader trenger jeg samtykke. Godkjenner du at jeg lagrer dette?" }]);
      return;
    }

    const res = await fetch("/api/backend/v1/preonboarding/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, patch }),
    });
    const data = await res.json();

    if (!data.ok) {
      setMsgs(m => [...m, { role: "coach", text: "Oops! Noe gikk galt. Prøv igjen." }]);
      return;
    }

    setCollected(data.collectedPercent ?? 0);

    if (data?.next?.type === "PREVIEW_READY") {
      const pr = await fetch("/api/backend/v1/preonboarding/preview");
      const pj = await pr.json();
      setPreview(pj.preview);
      setMsgs(m => [...m, { role: "coach", text: "Her er et første forslag til ukeplan. Vil du starte prøveperiode?" }]);
    } else {
      setMsgs(m => [...m, { role: "coach", text: askMore }]);
    }
  }

  async function giveConsent() {
    const r = await fetch("/api/backend/v1/preonboarding/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ healthData: true }),
    });
    const j = await r.json();
    if (j.ok) {
      setConsented(true);
      setMsgs(m => [...m, { role: "coach", text: "Takk. Du kan fortelle meg om skaden din, så tar jeg hensyn til det." }]);
    }
  }

  async function convert(type: "TRIAL" | "SUBSCRIBED") {
    const r = await fetch("/api/backend/v1/preonboarding/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType: type }),
    });
    const j = await r.json();
    if (j.ok) setMsgs(m => [...m, { role: "coach", text: "Flott! Jeg har aktivert første plan og Student Center for deg." }]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4 h-[50vh] overflow-auto bg-white">
        {msgs.map((m, i) => (
          <div key={i} className={`my-2 ${m.role === "user" ? "text-right" : ""}`}>
            <span className={`inline-block rounded-xl px-3 py-2 ${m.role === "user" ? "bg-gray-200" : "bg-black text-white"}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2"
          placeholder="Skriv til Coach Engh..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button className="rounded-xl border px-4 py-2" onClick={sendMessage}>Send</button>
      </div>

      <div className="text-sm opacity-70">Profil utfylt: {collected}%</div>

      {!consented && (
        <div className="rounded-xl border p-3">
          <div className="font-medium">Samtykke til helsedata</div>
          <p className="text-sm mt-1">For å lagre info om skader/helse trenger vi ditt samtykke.</p>
          <button className="mt-2 rounded-xl border px-3 py-2" onClick={giveConsent}>Jeg godkjenner</button>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <PlanPreviewCard data={preview} />
          <div className="flex gap-2">
            <button className="rounded-xl border px-3 py-2" onClick={() => convert("TRIAL")}>Start prøveperiode</button>
            <button className="rounded-xl border px-3 py-2" onClick={() => convert("SUBSCRIBED")}>Abonner nå</button>
          </div>
        </div>
      )}
    </div>
  );
}


