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
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatAnswer(message.text),
                    }}
                  />
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
