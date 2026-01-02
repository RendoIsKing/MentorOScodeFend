"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import DesignBottomNav from "@/components/design/DesignBottomNav";

function pageFromPath(pathname: string): "home" | "search" | "chat" | "profile" {
  if (pathname.startsWith("/feature/design/search")) return "search";
  if (pathname.startsWith("/feature/design/chat-wired")) return "chat";
  if (pathname.startsWith("/feature/design/home-wired")) return "home";
  if (pathname.startsWith("/feature/design/coach-majen")) return "chat";
  // Mentor pages should still highlight "Profile" tab in the bottom nav
  if (pathname.startsWith("/feature/design/mentor")) return "profile";
  if (pathname.startsWith("/feature/design/profile")) return "profile";
  if (pathname.startsWith("/feature/design/u/")) return "profile";
  return "home";
}

export default function DesignShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();

  return (
    <div className="min-h-dvh w-full">
      {children}
      <DesignBottomNav
        currentPage={pageFromPath(pathname)}
        onNavigate={(page) => {
          if (page === "home") router.push("/feature/design/home-wired");
          else if (page === "search") router.push("/feature/design/search");
          else if (page === "chat") router.push("/feature/design/chat-wired");
          else router.push("/feature/design/profile");
        }}
        onCreateClick={() => {
          router.push("/upload");
        }}
      />
    </div>
  );
}


