// import React, { useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// export interface Message {
//   sender: "user" | "other";
//   text: string;
//   name?: string;
//   time: string;
//   date: string;
// }
// const AvatarChatHistory: React.FC = () => {
//   // Dummy data for demonstration
//   const messages: Message[] = [
//     {
//       sender: "other",
//       text: "Hi there. How can I help you today?",
//       name: "Bob Marley",
//       time: "10:30 AM",
//       date: "Friday, 19 January",
//     },
//     {
//       sender: "user",
//       text: "Hi there. How can I help you today?",
//       time: "10:30 AM",
//       date: "Friday, 19 January",
//     },
//     {
//       sender: "other",
//       text: "Can you please send me the link of the project?",
//       name: "Bob Marley",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },
//     {
//       sender: "user",
//       text: "Yeah sure. Sending in a minutes.",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },
//     {
//       sender: "other",
//       text: "Hi there. How can I help you today?",
//       name: "Bob Marley",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },
//     {
//       sender: "user",
//       text: "Yeah sure. Sending in a minute.",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },
//     {
//       sender: "other",
//       text: "Hi there. How can I help you today?",
//       name: "Bob Marley",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },
//     {
//       sender: "user",
//       text: "Yeah sure. Sending in a minute.",
//       time: "10:30 AM",
//       date: "Saturday, 20 January",
//     },

//     // Add more messages as needed
//   ];

//   let currentDate: string | null = null;

//   return (
//     <div>
//       {messages.map((message, index) => {
//         const displayDateLabel = currentDate !== message.date;
//         currentDate = message.date;
//         return (
//           <div key={index}>
//             {displayDateLabel && (
//               <div className="text-base mt-1 rounded-full p-1 tracking-wide flex w-full justify-center cursor-pointer">
//                 <Badge className="text-foreground bg-muted">
//                   {message.date}{" "}
//                 </Badge>
//               </div>
//             )}
//             <div
//               className={cn(
//                 "flex",
//                 message.sender === "user" ? "justify-end" : "justify-start"
//               )}
//             >
//               <div
//                 className={cn(
//                   "my-4 p-4 rounded-xl w-auto",
//                   message.sender === "user"
//                     ? "text-right bg-primary"
//                     : "text-left bg-muted-foreground/10"
//                 )}
//               >
//                 {message.text}
//               </div>
//             </div>
//             <div
//               className={cn(
//                 "flex w-full",
//                 message.sender === "user"
//                   ? "text-right justify-end"
//                   : "text-left justify-start"
//               )}
//             >
//               <div className="w-1/4">{message.time}</div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };
// export default AvatarChatHistory;

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CloseIcon from "@/assets/images/my-Profile/closeIcon";
import { baseServerUrl } from "@/lib/utils";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

function formatAnswer(answer) {
  if (!answer || typeof answer !== "string") {
    return "";
  }
  return answer
    .replace(/###\s(.*?)\n/g, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/^- /gm, "<br/>- ")
    .replace(/\n/g, "<br/>");
}

export interface Message {
  sender: "user" | "other";
  text: string;
  time: string;
  date: string;
  image?: string;
}

interface AvatarChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

const AvatarChatHistory: React.FC<AvatarChatHistoryProps> = ({
  messages,
  isLoading,
}) => {
  let currentDate: string | null = null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageModal, setImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, 'idle'|'loading'|'done'|'error'>>({});
  const [saveMenuOpen, setSaveMenuOpen] = useState<Record<string, boolean>>({});
  const { user } = useUserOnboardingContext();

  async function resolveUserId(apiBase: string): Promise<string | undefined> {
    try {
      if (user?._id) return user._id;
      const me = await fetch(`${apiBase}/v1/auth/me`, { credentials: 'include' });
      const md = await me.json().catch(()=>({}));
      return md?.data?._id || md?.data?.id;
    } catch {
      return undefined;
    }
  }
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModal(true);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleImageCloseModal = () => {
    setImageModal(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      {messages.map((message, index) => {
        const displayDateLabel = currentDate !== message.date;
        currentDate = message.date;

        return (
          <div key={index}>
            {displayDateLabel && (
              <div className="text-base mt-1 rounded-full p-1 tracking-wide flex w-full justify-center cursor-pointer">
                <Badge className="text-foreground bg-muted">
                  {message.date}
                </Badge>
              </div>
            )}
            <div
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "my-4 p-4 rounded-xl w-auto",
                  message.sender === "user"
                    ? "text-right bg-primary"
                    : "text-left bg-muted-foreground/10"
                )}
              >
                {message.image ||
                (message.text.startsWith("https") &&
                  message.text.includes("s3")) ? (
                  <img
                    src={message.image || message.text}
                    onClick={() =>
                      handleImageClick(message.image || message.text)
                    }
                    alt="Response"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  message.text?.startsWith('[open:') ? (
                    <button
                      onClick={() => {
                        const label = message.text.replace('[open:','').replace(']','').toLowerCase();
                        const from = 'chat';
                        const src = typeof window !== 'undefined' ? window.location.pathname : '/room/Coach%20Engh';
                        if (label.includes('training')) window.location.href = `/plans/training?from=${from}&src=${encodeURIComponent(src)}`;
                        else if (label.includes('meal')) window.location.href = `/plans/nutrition?from=${from}&src=${encodeURIComponent(src)}`;
                        else window.location.href = `/plans/goals?from=${from}&src=${encodeURIComponent(src)}`;
                      }}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border hover:bg-muted"
                    >
                      {message.text.replace('[open:','').replace(']','')}
                    </button>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatAnswer(message.text),
                      }}
                    />
                  )
                )}
                {/* Save-as control under assistant messages */}
                {message.sender === 'other' && (
                  <div className="mt-2 relative inline-block">
                    <button
                      onClick={()=> setSaveMenuOpen(prev=>({ ...prev, [String(index)]: !prev[String(index)] }))}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border hover:bg-muted"
                    >
                      Save as…
                    </button>
                    {saveMenuOpen[String(index)] && (
                      <div className="absolute mt-1 w-44 rounded-md border bg-background shadow z-10">
                        <button
                          disabled={statusMap[`t-${index}`]==='loading' || statusMap[`t-${index}`]==='done'}
                          onClick={async ()=>{
                            try{
                              const apiBase = baseServerUrl || '/api/backend';
                              setStatusMap(prev=>({...prev,[`t-${index}`]:'loading'}));
                              const uid = await resolveUserId(apiBase);
                              const r = await fetch(`${apiBase}/v1/interaction/chat/engh/training/from-text`, {
                                method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
                                body: JSON.stringify({ text: message.text, userId: uid })
                              });
                              const d = await r.json();
                              if (d?.actions && d.actions.length) {
                                try { window.dispatchEvent(new CustomEvent('plansUpdated')); } catch {}
                                try {
                                  const snapRes = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
                                  if (snapRes.ok) { const snap = await snapRes.json(); sessionStorage.setItem('lastSnapshot', JSON.stringify(snap)); }
                                } catch {}
                                setStatusMap(prev=>({...prev,[`t-${index}`]:'done'}));
                              } else {
                                setStatusMap(prev=>({...prev,[`t-${index}`]:'error'}));
                              }
                            }catch{ setStatusMap(prev=>({...prev,[`t-${index}`]:'error'})); }
                          }}
                          className="block w-full text-left text-xs px-3 py-1.5 hover:bg-muted"
                        >
                          {statusMap[`t-${index}`]==='loading' ? 'Adding…' : statusMap[`t-${index}`]==='done' ? 'Added ✓' : 'Training plan'}
                        </button>
                        <button
                          disabled={statusMap[`m-${index}`]==='loading' || statusMap[`m-${index}`]==='done'}
                          onClick={async ()=>{
                            try{
                              const apiBase = baseServerUrl || '/api/backend';
                              setStatusMap(prev=>({...prev,[`m-${index}`]:'loading'}));
                              const uid = await resolveUserId(apiBase);
                              const r = await fetch(`${apiBase}/v1/interaction/chat/engh/nutrition/from-text`, {
                                method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
                                body: JSON.stringify({ text: message.text, userId: uid })
                              });
                              const d = await r.json();
                              if (d?.actions && d.actions.length) {
                                try { window.dispatchEvent(new CustomEvent('plansUpdated')); } catch {}
                                try {
                                  const snapRes = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
                                  if (snapRes.ok) { const snap = await snapRes.json(); sessionStorage.setItem('lastSnapshot', JSON.stringify(snap)); }
                                } catch {}
                                setStatusMap(prev=>({...prev,[`m-${index}`]:'done'}));
                              } else { setStatusMap(prev=>({...prev,[`m-${index}`]:'error'})); }
                            }catch{ setStatusMap(prev=>({...prev,[`m-${index}`]:'error'})); }
                          }}
                          className="block w-full text-left text-xs px-3 py-1.5 hover:bg-muted"
                        >
                          {statusMap[`m-${index}`]==='loading' ? 'Adding…' : statusMap[`m-${index}`]==='done' ? 'Added ✓' : 'Meal plan'}
                        </button>
                        <button
                          disabled={statusMap[`g-${index}`]==='loading' || statusMap[`g-${index}`]==='done'}
                          onClick={async ()=>{
                            try{
                              const apiBase = baseServerUrl || '/api/backend';
                              setStatusMap(prev=>({...prev,[`g-${index}`]:'loading'}));
                              const uid = await resolveUserId(apiBase);
                              const r = await fetch(`${apiBase}/v1/interaction/chat/engh/goals/from-text`, {
                                method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
                                body: JSON.stringify({ text: message.text, userId: uid })
                              });
                              const d = await r.json();
                              if (d?.actions && d.actions.length) {
                                try { window.dispatchEvent(new CustomEvent('plansUpdated')); } catch {}
                                try {
                                  const snapRes = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
                                  if (snapRes.ok) { const snap = await snapRes.json(); sessionStorage.setItem('lastSnapshot', JSON.stringify(snap)); }
                                } catch {}
                                setStatusMap(prev=>({...prev,[`g-${index}`]:'done'}));
                              } else { setStatusMap(prev=>({...prev,[`g-${index}`]:'error'})); }
                            }catch{ setStatusMap(prev=>({...prev,[`g-${index}`]:'error'})); }
                          }}
                          className="block w-full text-left text-xs px-3 py-1.5 hover:bg-muted"
                        >
                          {statusMap[`g-${index}`]==='loading' ? 'Adding…' : statusMap[`g-${index}`]==='done' ? 'Added ✓' : 'Goals'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* loader */}

            <div
              className={cn(
                "flex w-full",
                message.sender === "user"
                  ? "text-right justify-end"
                  : "text-left justify-start"
              )}
            >
              <div className="w-1/4">{message.time}</div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="loader border-t-2 border-primary rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Full Size"
              className="max-w-full max-h-screen rounded-lg "
            />
            <button
              onClick={handleImageCloseModal}
              className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-900 rounded-full p-2"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AvatarChatHistory;
