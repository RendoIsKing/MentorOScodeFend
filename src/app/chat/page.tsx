'use client';

import { useState } from "react";
import { chatCoachEngh, decideAndApply } from "@/lib/api/interaction";
import { useToast } from "@/components/ui/use-toast";

export default function CoachEnghChat() {
  const [messages, setMessages] = useState([
    {
      sender: "coach",
      text: `Hei! Jeg er Coach Engh. Før vi begynner, må jeg forstå deg litt bedre:\n\n1. Hva er målet ditt akkurat nå?\n2. Hva sliter du mest med?\n3. Hvor ofte trener du i uka?\n4. Har du spesielle matpreferanser eller allergier?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Chat med Coach Engh</h1>

        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded ${
                msg.sender === "coach"
                  ? "bg-blue-100 text-left"
                  : "bg-green-100 text-right"
              }`}
            >
              <pre className="whitespace-pre-wrap">{msg.text}</pre>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2"
            placeholder="Skriv til Coach Engh..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Sender..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
