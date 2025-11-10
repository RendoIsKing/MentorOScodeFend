"use client";
import { useEffect, useRef, useState, memo } from 'react';
import Link from "next/link";
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";
import { useFollowUserMutation, usersApi } from "@/redux/services/haveme/user";
import { postsApi } from "@/redux/services/haveme/posts";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_TAGGED_USERS_LIST, TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_FILE_INFO_BY_ID, TAG_GET_USER_INFO, TAG_GET_FILE_INFO } from "@/contracts/haveme/haveMeApiTags";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";



type Post = {
  id: string;
  type: 'image' | 'video';
  src: string;
  visibility?: 'public' | 'followers' | 'subscribers';
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
  // Read once at the component root so hooks order never changes
  const { isMobile } = useClientHardwareInfo();
  // Session-local followed authors to keep pill hidden even before refetch returns
  const [followedBySession, setFollowedBySession] = useState<Record<string, boolean>>({});
  const [recentlyFollowedAt, setRecentlyFollowedAt] = useState<Record<string, number>>({});
  // Force-refresh key to trigger recompute if cache updates for the same author while staying on this post
  const [cacheBump, setCacheBump] = useState<number>(0);

  // Load persisted followed authors on mount so pill stays hidden after navigation
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setFollowedBySession(parsed);
      }
    } catch {}
  }, []);

  // Keep in sync if other parts of the app update follow cache
  useEffect(() => {
    const loadCache = () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
        const next = raw ? JSON.parse(raw) : {};
        if (next && typeof next === 'object') setFollowedBySession(next);
      } catch {}
    };
    const onStorage = (e?: StorageEvent) => {
      if (!e || e.key === 'followedAuthors') loadCache();
    };
    const onCustom = () => { loadCache(); setCacheBump((x) => x + 1); };
    const onVisible = () => { if (document.visibilityState === 'visible') loadCache(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('follow-cache-changed', onCustom as any);
      document.addEventListener('visibilitychange', onVisible);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('follow-cache-changed', onCustom as any);
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
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
  const authorUserName = active?.user?.username ? String(active.user.username) : "";
  const authorKey = authorId || authorUserName;
  const isOwn = Boolean(currentUserId && authorId && String(currentUserId) === authorId);
  // Prefer local session cache if present; fall back to server-provided viewerFollows
  const cachedFollow = ((): boolean | undefined => {
    // Accept both id and username keys from cache for robustness
    const byId = authorId ? followedBySession[authorId] : undefined;
    const byUser = authorUserName ? followedBySession[authorUserName] : undefined;
    const byUserLc = authorUserName ? followedBySession[authorUserName.toLowerCase()] : undefined;
    return typeof byId === 'boolean' ? byId : (typeof byUser === 'boolean' ? byUser : (typeof byUserLc === 'boolean' ? byUserLc : undefined));
  })(); // cacheBump keeps this recalculating
  const isFollowingNow = typeof cachedFollow === 'boolean' ? cachedFollow : Boolean(active?.user?.viewerFollows);
  // If server says following but cache explicitly says false, respect cache for a short time after change

  // (Intentionally no auto-clear here; unfollow flows should explicitly clear cache)


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
      {active?.user && isMobile ? (
        createPortal(
          (() => {
            const hasOpenUi = typeof document !== 'undefined' && Boolean(
              document.querySelector('[role="dialog"][data-state="open"], .DialogContent[data-state="open"], .DrawerContent[data-state="open"], [data-radix-portal] [data-state="open"]')
            );
            if (hasOpenUi) return null;
            return (
              <div data-test="author-bar" className="fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+8px)] z-[2147483647] pointer-events-auto">
                <div className="absolute -inset-x-3 -top-3 h-24 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Link
                      data-test="author-link"
                      href={`/${active.user?.username || active.user?.id || ""}`}
                      className="flex items-center gap-2 rounded-full bg-background/40 px-2 py-1"
                    >
                      <img src={(active as any).user?.avatarUrl || "/assets/images/Home/small-profile-img.svg"} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-foreground leading-tight">{active.user.displayName || active.user.username || ""}</span>
                        {active?.createdAt ? (
                          <span className="text-xs text-muted-foreground leading-tight">{formatRelativeTime(active.createdAt)}</span>
                        ) : null}
                      </div>
                    </Link>
                    {/* Follow pill only on mobile */}
                    {!isOwn && !isFollowingNow ? (
                      <FollowPill
                        authorId={authorId}
                        authorName={active.user.displayName || active.user.username || "user"}
                        onFollowed={() => setFollowedBySession((prev) => {
                          const key = authorKey;
                          const next = { ...prev } as Record<string, boolean>;
                          if (key) next[key] = true;
                          if (authorId) next[authorId] = true;
                          if (authorUserName) {
                            next[authorUserName] = true;
                            next[authorUserName.toLowerCase()] = true;
                          }
                          try {
                            if (typeof window !== 'undefined') {
                              window.localStorage.setItem('followedAuthors', JSON.stringify(next));
                              const evt = new Event('follow-cache-changed');
                              window.dispatchEvent(evt);
                            }
                          } catch {}
                          setRecentlyFollowedAt((prevTs) => (key ? { ...prevTs, [key]: Date.now() } : prevTs));
                          return next;
                        })}
                      />
                    ) : null}
                  </div>
                  <FeedSwitcher />
                </div>
              </div>
            );
          })(),
          document.body
        )
      ) : null}
    </section>
  );
}

const FullBleedItem = memo(function FullBleedItem({
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
  }, [post.id, post.type]);

  return (
    <article className="relative h-full min-h-full snap-start">
      {/* Gradient for readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/60 to-transparent z-10" />

      {/* Visibility badge */}
      <div className="absolute left-3 top-3 z-30 pointer-events-none">
        {post.visibility ? (
          <span
            data-test="visibility-badge"
            className={cn(
              "pointer-events-auto select-none rounded-full px-2 py-1 text-xs font-semibold",
              post.visibility === 'public' ? 'bg-background/90 text-foreground' :
              post.visibility === 'followers' ? 'bg-amber-400 text-foreground' :
              'bg-emerald-400 text-foreground'
            )}
            aria-label={`Visibility: ${post.visibility}`}
            title={`Visibility: ${post.visibility}`}
          >
            {post.visibility === 'public' ? 'Public' : post.visibility === 'followers' ? 'Followers' : 'Subscribers'}
          </span>
        ) : null}
      </div>

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

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/60 to-transparent" />

      {RightOverlay ? (
        <div data-test="right-rail" className="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h)+8px)] z-30">
          <RightOverlay post={post} />
        </div>
      ) : null}

      {/* Report action (always available) */}
      <div className="absolute right-3 top-3 z-30">
        <ReportButton postId={post.id} />
      </div>

      {/* Caption bar - always show if provided */}
      {post?.caption ? (
        <div
          data-test="caption-bar"
          className="absolute left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h)+8px)] z-20 pointer-events-none"
        >
          <div className="bg-background/45 rounded-xl px-3 py-2 pointer-events-auto">
            <p className="text-foreground text-[15px] leading-snug clamp-2">{post.caption}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}, (prev, next) => {
  // Prevent re-render unless identity-critical fields change
  return (
    prev.post.id === next.post.id &&
    prev.post.src === next.post.src &&
    prev.post.type === next.post.type &&
    (prev.post.user?.viewerFollows ?? false) === (next.post.user?.viewerFollows ?? false) &&
    prev.currentUserId === next.currentUserId
  );
});

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
        const res = await (followUser as any)({ followingTo: authorId }).unwrap?.();
        onFollowed();
        // Persist + broadcast so Profile picks up the change immediately
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
          const map = raw ? JSON.parse(raw) : {};
          map[String(authorId)] = true;
          // also by username lower-case if available via data attribute
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('followedAuthors', JSON.stringify(map));
            const evt = new Event('follow-cache-changed');
            window.dispatchEvent(evt);
          }
        } catch {}
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

function FeedSwitcher() {
  const [label, setLabel] = useState<string>("Feed");
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('homeFeedFilter') : null;
      const v = (raw || 'feed').toLowerCase();
      setLabel(v === 'following' ? 'Following' : v === 'subscribed' ? 'Subscribed' : 'Feed');
    } catch {}
  }, []);
  const onSelect = (key: 'feed' | 'subscribed' | 'following') => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('homeFeedFilter', key);
        const evt = new Event('feed-filter-changed');
        window.dispatchEvent(evt);
      }
      setLabel(key === 'following' ? 'Following' : key === 'subscribed' ? 'Subscribed' : 'Feed');
    } catch {}
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full bg-background/40 px-3 py-1 text-sm font-semibold text-foreground">
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 border-border bg-card">
        <DropdownMenuItem onClick={() => onSelect('feed')}>Feed</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('subscribed')}>Subscribed</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('following')}>Following</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

// --- Visibility badge + Report button additions inside the feed item ---
function ReportButton({ postId }: { postId: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const onReport = async () => {
    if (busy || done) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/backend/v1/post/${encodeURIComponent(postId)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inappropriate' }),
        credentials: 'include',
      });
      if (res.ok) setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };
  if (done) return (
    <span className="rounded-full bg-background/40 px-2 py-1 text-xs font-semibold text-foreground">Reported</span>
  );
  return (
    <button
      data-test="report-button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReport(); }}
      disabled={busy}
      className="rounded-full bg-background/40 px-2 py-1 text-xs font-semibold text-foreground hover:bg-background/60"
      aria-label="Report post"
      title="Report post"
    >
      {busy ? '…' : 'Report'}
    </button>
  );
}