import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function getUserProgress(request: NextRequest, userAuthToken: string) {
  try {
    // Always use an absolute URL inside middleware
    // Always proxy via Next origin to avoid cross-site preflight inside middleware
    const apiBase = `${request.nextUrl.origin}/api/backend`;

    const headers: Record<string, string> = {};
    // Prefer cookie-based auth to avoid CORS preflight with Authorization header
    if (userAuthToken) headers["cookie"] = `auth_token=${userAuthToken}`;

    const response = await fetch(`${apiBase}/v1/auth/me`, { method: "GET", headers, cache: 'no-store' });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const userAuthToken = request.cookies.get("auth_token");
  const currentPath = request.nextUrl.pathname;

  // Normalize host and hard-redirect any app.* subdomain to the apex
  const host = request.headers.get('host') || '';
  if (host.startsWith('app.')) {
    const target = `https://${host.replace(/^app\./, '')}${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    return NextResponse.redirect(target);
  }

  // Always base redirects on current host (without app.)
  const baseDomain = `https://${host}`;

  // Public paths that don't require authentication
  const publicPaths = [
    "/signup",
    "/verify-otp",
    "/signin",
    "/forgotpassword",
    "/admin",
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.includes(currentPath);

  // Initial onboarding path that should be accessible after signup
  const isInitialOnboardingPath = currentPath === "/user-info";

  // Allow access to initial onboarding path without forcing /auth/me first
  if (isInitialOnboardingPath) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route
  if (!userAuthToken && !isPublicPath) {
    // Check if the user is already on /signin, /signup, /forgotpassword, or /
    if (currentPath === "/signin" || currentPath === "/signup" || currentPath === "/forgotpassword" || currentPath === "/") {
      return NextResponse.next();
    }
    if (process.env.NODE_ENV === "production") {
      const signupUrl = new URL("/signin", baseDomain);
      return NextResponse.redirect(signupUrl);
    }
  }

  // No special redirect for inbox

  // Handle authenticated routes
  if (userAuthToken?.value) {
    const userProgress = await getUserProgress(request, userAuthToken.value);

    // If failed to fetch user progress, redirect to signup
    if (!userProgress?.data && process.env.NODE_ENV === "production") {
      const signupUrl = new URL("/signup", baseDomain);
      return NextResponse.redirect(signupUrl);
    }

    // Modify onboarding steps to allow access
    const u = userProgress?.data || {} as any;
    const needsInfo = !(u?.hasPersonalInfo === true);
    const needsPhoto = !(u?.hasPhotoInfo === true);
    const needsTags = !(u?.hasSelectedInterest === true);
    const pathsAndChecks = [
      { path: "/user-info", check: !needsInfo },
      { path: "/user-photo", check: !needsPhoto },
      { path: "/user-tags", check: !needsTags },
      { path: "/age-confirmation", check: true },
    ];

    // Don't redirect away from current onboarding step
    for (const element of pathsAndChecks) {
      if (element.path === currentPath) {
        return NextResponse.next();
      } else if (!element.check && process.env.NODE_ENV === "production") {
        return NextResponse.redirect(
          new URL(element.path, baseDomain)
        );
      }
    }

    const allStepsCompleted = pathsAndChecks.every((element) => element.check);

    // Routes that require subscription
    const subscriptionRequiredPaths = [
      "/chat",
      "/creator-center",
      "/search",
      // "/wallet",
    ];

    // Check if current path requires subscription
    const requiresSubscription = subscriptionRequiredPaths.some((path) =>
      currentPath.startsWith(path)
    );

    // If we just came from verify-otp, always send to the first onboarding step
    const fromVerify = request.nextUrl.searchParams.get("from") === "verify";
    if (fromVerify) {
      return NextResponse.redirect(new URL("/user-info", baseDomain));
    }

    // Redirect authenticated users away from auth pages if fully onboarded
    if (isPublicPath && allStepsCompleted && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(
        new URL("/home", baseDomain)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/verify-otp",
    "/user-info",
    "/user-photo",
    "/user-tags",
    "/age-confirmation",
    "/billing",
    "/home/:id*",
    "/chat/:id*",
    "/search/:id*",
    "/wallet/:id*",
    "/creator-center/:id*",
    "/notification/:id*",
    "/settings/:id*",
    "/admin/:id*",
  ],
};
