'use client';

export default function ChatIframePage() {
  return (
    <div className="h-dvh w-full">
      <iframe
        src="/chat-mfe/index.html"
        title="Chat"
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
