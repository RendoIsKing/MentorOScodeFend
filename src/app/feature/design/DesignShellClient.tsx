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
  // Some design routes implement their own fixed bottom action bars (e.g. onboarding wizard).
  // Hide the global bottom nav there to avoid blocking taps.
  const hideNav =
    pathname.startsWith("/feature/design/create") ||
    pathname.startsWith("/feature/design/mentor-onboarding");

  return (
    <div className="min-h-dvh w-full">
      {children}
      {!hideNav && (
        <DesignBottomNav
          currentPage={pageFromPath(pathname)}
          onNavigate={(page) => {
            if (page === "home") router.push("/feature/design/home-wired");
            else if (page === "search") router.push("/feature/design/search");
            else if (page === "chat") router.push("/feature/design/chat-wired");
            else router.push("/feature/design/profile");
          }}
          onCreateClick={() => {
            router.push("/feature/design/create");
          }}
        />
      )}
    </div>
  );
}


