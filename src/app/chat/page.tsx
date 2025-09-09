'use client';

import { useEffect, useRef, useState } from "react";
import AssetsSheet from "@/components/mobile/AssetsSheet";
import { Plus, Send } from "lucide-react";
import { chatCoachEngh, decideAndApply } from "@/lib/api/interaction";
import { useToast } from "@/components/ui/use-toast";

export default function CoachEnghChat() {
  const [messages, setMessages] = useState([
    {
      sender: "coach",
      text: `Hei! Jeg er din coach. Før vi begynner, må jeg forstå deg litt bedre:\n\n1. Hva er målet ditt akkurat nå?\n2. Hva sliter du mest med?\n3. Hvor ofte trener du i uka?\n4. Har du spesielle matpreferanser eller allergier?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const [reply, action] = await Promise.all([
        chatCoachEngh(input, newMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))),
        decideAndApply(input).catch(() => ({ noAction: true })),
      ]);

      if (reply?.reply) {
        setMessages([...newMessages, { sender: "coach", text: reply.reply }]);
      }

      if (action && !action.noAction && action.summary) {
        toast({ description: `Applied: ${action.summary}` });
        try {
          // Notify Student Center (and any listeners) to refresh snapshot
          window.dispatchEvent(new Event('plansUpdated'));
          window.dispatchEvent(new Event('student-snapshot-refresh'));
        } catch {}
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: "coach", text: "Beklager, noe gikk galt. Prøv igjen senere." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" }); }, [messages]);

  return (
    <div className="flex flex-col h-dvh bg-background">
      <div className="relative h-28 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="absolute left-4 top-14 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden ring-1 ring-black/10 bg-muted">
            <img src="/assets/images/inbox/the-pt.jpg" alt="Coach (AI)" className="h-full w-full object-cover" />
          </div>
          <div className="text-base font-medium">Coach (AI)</div>
        </div>
        <div className="absolute left-2 top-6">
          <button onClick={()=>history.back()} className="h-9 w-9 rounded-full border flex items-center justify-center">←</button>
        </div>
        <div className="absolute right-4 top-14">
          <AssetsSheet iconOnly triggerLabel="Assets" menu="plans" />
        </div>
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto px-4 py-2">
        <div className="mx-auto max-w-screen-sm space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.sender === 'user' ? 'bg-emerald-100 text-emerald-950' : 'bg-blue-100 text-blue-950'} rounded-2xl px-3 py-2 leading-relaxed text-[15px] max-w-[85%] sm:max-w-[70%]`}>
                <pre className="whitespace-pre-wrap">{msg.text}</pre>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="pb-safe px-3 py-2">
        <form onSubmit={(e)=>{e.preventDefault(); sendMessage();}} className="mx-auto flex max-w-screen-sm items-center gap-2">
          <button type="button" className="h-11 w-11 rounded-full border flex items-center justify-center"><Plus size={18} /></button>
          <input value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 h-11 rounded-full bg-black/50 border px-4 outline-none placeholder:text-muted-foreground" placeholder="Skriv en melding..." />
          <button type="submit" disabled={loading} className="h-11 w-11 rounded-full bg-[#7C3AED] text-white flex items-center justify-center"><Send size={18} /></button>
        </form>
      </div>

      <div className="hidden md:block" />
    </div>
  );
}
