"use client";
import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";
import { useFollowUserMutation, usersApi } from "@/redux/services/haveme/user";
import { postsApi } from "@/redux/services/haveme/posts";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_TAGGED_USERS_LIST, TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_FILE_INFO_BY_ID, TAG_GET_USER_INFO, TAG_GET_FILE_INFO } from "@/contracts/haveme/haveMeApiTags";



type Post = {
  id: string;
  type: 'image' | 'video';
  src: string;
  user?: {
    id?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    viewerFollows?: boolean;
  };
  caption?: string;
  createdAt?: string;
  likesCount?: number;
  commentsCount?: number;
  savedCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

export default function FullBleedFeed({
  posts,
  TopOverlay,
  RightOverlay,
  initialIndex,
  currentUserId,
}: {
  posts: Post[];
  TopOverlay?: () => JSX.Element;
  RightOverlay?: (args: { post: Post }) => JSX.Element;
  initialIndex?: number;
  currentUserId?: string | null;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(typeof initialIndex === 'number' ? Math.max(0, Math.min(initialIndex, posts.length - 1)) : 0);
  // Session-local followed authors to keep pill hidden even before refetch returns
  const [followedBySession, setFollowedBySession] = useState<Record<string, boolean>>({});
  const [recentlyFollowedAt, setRecentlyFollowedAt] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setFollowedBySession(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!scrollerRef.current) return;
    if (typeof initialIndex !== 'number') return;
    if (initialIndex < 0 || initialIndex >= posts.length) return;
    const el = scrollerRef.current;
    const offset = initialIndex * el.clientHeight;
    try {
      el.scrollTo({ top: offset, behavior: 'instant' as ScrollBehavior });
    } catch {
      el.scrollTop = offset;
    }
  }, [initialIndex, posts.length]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== currentIndex && idx >= 0 && idx < posts.length) setCurrentIndex(idx);
  };

  const active = posts[currentIndex];
  const authorId = active?.user?.id ? String(active.user.id) : "";
  const isOwn = Boolean(currentUserId && authorId && String(currentUserId) === authorId);
  const isFollowingNow = Boolean((authorId && followedBySession[authorId]) || active?.user?.viewerFollows);

  // Reconcile: if server says not following anymore, clear local cache so pill reappears
  useEffect(() => {
    if (!authorId) return;
    const serverFollowing = Boolean(active?.user?.viewerFollows);
    if (!serverFollowing && followedBySession[authorId]) {
      const last = recentlyFollowedAt[authorId] || 0;
      // Skip clearing for a short window after a follow to avoid flicker before refetch
      if (Date.now() - last < 30000) return;
      setFollowedBySession((prev) => {
        const next = { ...prev };
        delete next[authorId];
        try { if (typeof window !== 'undefined') window.localStorage.setItem('followedAuthors', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, [authorId, active?.user?.viewerFollows, followedBySession, recentlyFollowedAt]);


  return (
    <section className="relative h-full w-full overflow-hidden">
      <div ref={scrollerRef} onScroll={handleScroll} className="vh-screen h-full w-full overflow-y-auto snap-y snap-mandatory snap-always overscroll-contain pb-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h))]">
      {TopOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="pointer-events-auto">{<TopOverlay />}</div>
        </div>
      ) : null}

        {posts.map((post) => (
          <FullBleedItem key={post.id} post={post} RightOverlay={RightOverlay} currentUserId={currentUserId} />)
        )}
      </div>

      {/* Fixed author bar overlay for the currently visible post */}
      {active?.user ? (
        createPortal(
          <div data-test="author-bar" className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+8px)] z-[2147483647] pointer-events-auto">
            <div className="absolute -inset-x-3 -top-3 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <Link
                data-test="author-link"
                href={`/${active.user?.username || active.user?.id || ""}`}
                className="flex items-center gap-2 rounded-full bg-black/35 px-2 py-1"
              >
                <img src={active.user.avatarUrl || "/images/avatar-fallback.png"} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-white leading-tight">{active.user.displayName || active.user.username || ""}</span>
                  {active?.createdAt ? (
                    <span className="text-xs text-white/80 leading-tight">{formatRelativeTime(active.createdAt)}</span>
                  ) : null}
                </div>
              </Link>
              <div className="grow" />
              {!isOwn && !isFollowingNow ? (
                <FollowPill
                  authorId={authorId}
                  authorName={active.user.displayName || active.user.username || "user"}
                  onFollowed={() => setFollowedBySession((prev) => {
                    const next = { ...prev, [authorId]: true };
                    try { if (typeof window !== 'undefined') window.localStorage.setItem('followedAuthors', JSON.stringify(next)); } catch {}
                    setRecentlyFollowedAt((prevTs) => ({ ...prevTs, [authorId]: Date.now() }));
                    return next;
                  })}
                />
              ) : null}
            </div>
          </div>,
          document.body
        )
      ) : null}
    </section>
  );
}

function FullBleedItem({
  post,
  RightOverlay,
  currentUserId,
}: {
  post: Post;
  RightOverlay?: (args: { post: Post }) => JSX.Element;
  currentUserId?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (post.type !== 'video' || !videoRef.current) return;
    const el = videoRef.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [post]);

  return (
    <article className="relative h-full min-h-full snap-start">
      {/* Gradient for readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent z-10" />

      {/* Media as background only - do not intercept taps */}
      {post.type === 'video' ? (
        <video
          ref={videoRef}
          src={post.src}
          playsInline
          muted
          loop
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      ) : (
        <img src={post.src} alt="" className="absolute inset-0 h-full w-full object-cover pointer-events-none" loading="lazy" />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      {RightOverlay ? (
        <div data-test="right-rail" className="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h)+8px)] z-30">
          <RightOverlay post={post} />
        </div>
      ) : null}

      {/* Caption bar - always show if provided */}
      {post?.caption ? (
        <div
          data-test="caption-bar"
          className="absolute left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h)+8px)] z-20 pointer-events-none"
        >
          <div className="bg-black/45 rounded-xl px-3 py-2 pointer-events-auto">
            <p className="text-white text-[15px] leading-snug clamp-2">{post.caption}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function FollowPill({ authorId, authorName, onFollowed }: { authorId: string; authorName: string; onFollowed: () => void }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [followUser] = useFollowUserMutation();
  const appDispatch = useAppDispatch();

  const onFollow = async () => {
    if (busy || done) return;
    setBusy(true);
    try {
      if (authorId) {
        await (followUser as any)({ followingTo: authorId }).unwrap?.();
        onFollowed();
        // Invalidate tags so server state refreshes across views
        appDispatch(postsApi.util.invalidateTags([TAG_GET_FILE_INFO, TAG_GET_TAGGED_USERS_LIST] as any));
        appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_USER_INFO] as any));
      }
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (done) return null;

  return (
    <button
      data-test="follow-pill"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFollow(); }}
      disabled={busy}
      className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-black shadow active:scale-[0.98]"
      aria-label={`Follow ${authorName}`}
    >
      {busy ? "…" : "Følg"}
    </button>
  );
}

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  } catch { return ""; }
}
