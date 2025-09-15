import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function getUserProgress(request: NextRequest, userAuthToken: string) {
  try {
    // Always use an absolute URL inside middleware
    const configured = process.env.NEXT_PUBLIC_API_SERVER;
    const apiBase = configured && /^https?:\/\//.test(configured)
      ? configured
      : `${request.nextUrl.origin}/api/backend`;

    const headers: Record<string, string> = {};
    if (process.env.NEXT_PUBLIC_API_SERVER) {
      // When talking directly to the backend, prefer Bearer auth
      headers["Authorization"] = `Bearer ${userAuthToken}`;
    } else if (userAuthToken) {
      // When using the Next proxy, forward the cookie for session auth
      headers["cookie"] = `auth_token=${userAuthToken}`;
    }

    const response = await fetch(`${apiBase}/v1/auth/me`, { method: "GET", headers });
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

  // Prefer env in production, but fall back to current request origin
  const baseDomain = process.env.NEXT_PUBLIC_DOMAIN || request.nextUrl.origin;

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

  // Allow access to initial onboarding path if auth token exists
  if (isInitialOnboardingPath && userAuthToken) {
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
    const pathsAndChecks = [
      { path: "/user-info", check: true },
      { path: "/user-photo", check: true },
      { path: "/user-tags", check: true },
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

    const allStepsCompleted = pathsAndChecks.every(
      (element) => element.check
    );

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

    // Redirect authenticated users away from auth pages
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
