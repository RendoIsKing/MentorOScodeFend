"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FeedFilterKey = "feed" | "following" | "subscribed";

export function NewFeedTopOverlay({
  value,
  onChange,
}: {
  value: FeedFilterKey;
  onChange: (v: FeedFilterKey) => void;
}) {
  const label = value === "following" ? "Following" : value === "subscribed" ? "Subscribed" : "Feed";

  return (
    <div className="pointer-events-none">
      <div className="pointer-events-auto mx-auto w-full max-w-[520px] px-4 pt-[calc(env(safe-area-inset-top)+8px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/brand/mentorio-wordmark.svg"
              alt="MentorOS"
              className="h-8 w-auto drop-shadow-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-black/35 text-white px-3 py-1.5 text-sm font-semibold backdrop-blur hover:bg-black/45"
                aria-label="Select feed filter"
                data-test="feed-filter"
              >
                {label} <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-44 border-white/10 bg-black/90 text-white backdrop-blur"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuItem onClick={() => onChange("feed")}>Feed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChange("following")}>Following</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChange("subscribed")}>Subscribed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


