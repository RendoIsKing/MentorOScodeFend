"use client";

import * as React from "react";
import clsx from "clsx";

type Props = {
  userId: string;
  username: string;
  avatarUrl?: string;
  isFollowing: boolean;
  onFollow: () => Promise<void> | void;
  onOpenProfile?: () => void;
  className?: string;
};

export default function FollowHeader({
  userId,
  username,
  avatarUrl,
  isFollowing,
  onFollow,
  onOpenProfile,
  className,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const handleFollow = async () => {
    if (loading || isFollowing) return;
    try {
      setLoading(true);
      await onFollow();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-x-0 top-0 z-30 select-none",
        className
      )}
    >
      <div className="h-16 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="pointer-events-auto mx-3 -mt-12 flex items-center gap-2 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm md:mx-4 md:-mt-[56px]">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 pr-2"
          aria-label={`Åpne profil for ${username}`}
        >
          <img
            src={avatarUrl || "/images/avatar-fallback.png"}
            alt=""
            className="h-8 w-8 rounded-full object-cover md:h-9 md:w-9"
          />
          <span className="text-sm font-medium text-white md:text-base">
            {username}
          </span>
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleFollow}
          disabled={loading || isFollowing}
          aria-pressed={isFollowing}
          className={clsx(
            "h-9 min-w-[90px] rounded-full px-4 text-sm font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/60",
            isFollowing
              ? "bg-white/10 text-white/80 cursor-default"
              : "bg-violet-600 text-white hover:bg-violet-500"
          )}
        >
          {loading ? "…" : isFollowing ? "Følger ✓" : "Følg"}
        </button>
      </div>
    </div>
  );
}


