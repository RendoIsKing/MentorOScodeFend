import React from "react";
import { Message } from "@/components/chat/avatar-chat";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CreatorChatHistory: React.FC = () => {
  // Dummy data for demonstration
  const messages: Message[] = [
    {
      sender: "other",
      text: "Hi there. How can I help you today?",
      name: "Bob Marley",
      time: "10:30 AM",
      date: "Friday, 19 January",
    },
    {
      sender: "user",
      text: "Hi there. How can I help you today?",
      time: "10:30 AM",
      date: "Friday, 19 January",
    },
    {
      sender: "other",
      text: "Can you please send me the link of the project?",
      name: "Bob Marley",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },
    {
      sender: "user",
      text: "Yeah sure. Sending in a minutes.",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },
    {
      sender: "other",
      text: "Hi there. How can I help you today?",
      name: "Bob Marley",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },
    {
      sender: "user",
      text: "Yeah sure. Sending in a minute.",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },
    {
      sender: "other",
      text: "Hi there. How can I help you today?",
      name: "Bob Marley",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },
    {
      sender: "user",
      text: "Yeah sure. Sending in a minute.",
      time: "10:30 AM",
      date: "Saturday, 20 January",
    },

    // Add more messages as needed
  ];

  let currentDate: string | null = null;

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
                  {message.date}{" "}
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
                  "my-4 p-3 rounded-xl w-auto",
                  message.sender === "user"
                    ? "text-right bg-primary"
                    : "text-left bg-muted-foreground/10"
                )}
              >
                {message.text}
              </div>
            </div>
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
    </div>
  );
};

export default CreatorChatHistory;
