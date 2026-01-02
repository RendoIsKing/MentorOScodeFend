"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} fill={active ? "currentColor" : "none"} />
    </svg>
  );
}
function IconInbox({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M3 13h4l2 3h6l2-3h4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
    </svg>
  );
}
function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}/>
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}/>
    </svg>
  );
}
function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
    </svg>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const is = (href: string) => pathname === href || pathname?.startsWith(href);

  const designEnabled =
    String(process.env.NEXT_PUBLIC_DESIGN || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_HOME || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_SEARCH || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_CHAT || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_MAJEN || "") === "1";

  // Avoid unnecessary /auth/me calls on auth pages or when no session cookie exists
  const isAuthPage = Boolean(
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname?.startsWith("/forgotpassword") ||
    pathname?.startsWith("/new-password") ||
    pathname?.startsWith("/validate-otp") ||
    pathname?.startsWith("/verify-otp") ||
    pathname?.startsWith("/google-user-info")
  );
  const hasSessionCookie =
    typeof document !== "undefined" && document.cookie.includes("auth_token=");

  const { data } = useGetUserDetailsQuery(undefined, { skip: !hasSessionCookie });

  // Do not render bottom bar on auth-related pages
  if (isAuthPage) return null;
  const profileUserName = (data?.data?.userName || data?.data?.fullName || '').toString();
  const profileHref = designEnabled
    ? "/feature/design/profile"
    : (profileUserName ? `/${profileUserName}` : "/signin");

  const homeHref = designEnabled ? "/feature/design/home-wired" : "/home";
  const searchHref = designEnabled ? "/feature/design/search" : "/search";
  const inboxHref = designEnabled ? "/feature/design/chat-wired" : "/room";

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-[9999] pointer-events-auto" data-test="bottom-nav">
      <div className="mx-auto max-w-[680px] px-5 pt-1.5 pb-[max(env(safe-area-inset-bottom),12px)] bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative grid grid-cols-3 items-end h-[var(--tabbar-height)]">
        <ul className="flex items-center gap-6">
          <li>
            <Link href={homeHref} className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${is("/home") || is("/feature/design/home-wired") || pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"}`} aria-label="Home">
              <div className="h-6 w-6"><IconHome active={Boolean(is("/home") || is("/feature/design/home-wired") || pathname === "/")} /></div>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href={searchHref} className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${is("/search") || is("/feature/design/search") ? "text-primary font-medium" : "text-muted-foreground"}`} aria-label="Search">
              <div className="h-6 w-6"><IconSearch active={Boolean(is("/search") || is("/feature/design/search"))} /></div>
              <span>Search</span>
            </Link>
          </li>
        </ul>

        <div className="relative flex items-center justify-center">
          <Link href="/upload" aria-label="Post" className="group text-center justify-self-center">
            <div className="h-11 w-11 rounded-2xl shadow-xl ring-1 ring-black/10 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground group-active:text-primary">Post</div>
          </Link>
        </div>

        <ul className="flex items-center justify-end gap-6">
          <li>
            <Link href={inboxHref} className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${is("/room") || is("/feature/design/chat-wired") ? "text-primary font-medium" : "text-muted-foreground"}`} aria-label="Inbox">
              <div className="h-6 w-6"><IconInbox active={Boolean(is("/room") || is("/feature/design/chat-wired"))} /></div>
              <span>Inbox</span>
            </Link>
          </li>
          <li>
            <Link href={profileHref} className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${is(profileHref) ? "text-primary font-medium" : "text-muted-foreground"}`} aria-label="Profile">
              <div className="h-6 w-6"><IconUser active={Boolean(is(profileHref))} /></div>
              <span>Profile</span>
            </Link>
          </li>
        </ul>
        </div>
      </div>
    </nav>
  );
}


