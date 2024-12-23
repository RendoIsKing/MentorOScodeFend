import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function getUserProgress(userAuthToken: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/v1/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
        },
      }
    );
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
    const signupUrl = new URL("/signup", process.env.NEXT_PUBLIC_DOMAIN);
    return NextResponse.redirect(signupUrl);
  }

  // Handle authenticated routes
  if (userAuthToken?.value) {
    const userProgress = await getUserProgress(userAuthToken.value);

    // If failed to fetch user progress, redirect to signup
    if (!userProgress?.data) {
      const signupUrl = new URL("/signup", process.env.NEXT_PUBLIC_DOMAIN);
      return NextResponse.redirect(signupUrl);
    }

    const isAdmin = userProgress?.data?.role === "admin" ? true : false;
    const hasActiveSubscription =
      userProgress?.data?.platformSubscription?.status === "active";

    // Admin route handling
    if (isAdmin) {
      if (!currentPath.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL("/admin/dashboard", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }
    } else {
      // Prevent non-admins from accessing admin routes
      if (currentPath.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }

      // Onboarding steps check
      const pathsAndChecks = [
        { path: "/user-info", check: userProgress.data.hasPersonalInfo },
        { path: "/user-photo", check: userProgress.data.hasPhotoInfo },
        { path: "/user-tags", check: userProgress.data.hasSelectedInterest },
        { path: "/age-confirmation", check: userProgress.data.hasConfirmedAge },
      ];

      // Don't redirect away from current onboarding step
      for (const element of pathsAndChecks) {
        if (element.path === currentPath) {
          return NextResponse.next();
        } else if (!element.check) {
          return NextResponse.redirect(
            new URL(element.path, process.env.NEXT_PUBLIC_DOMAIN)
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

      // Handle subscription required paths
      if (requiresSubscription && !hasActiveSubscription) {
        const response = NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_DOMAIN}/home`
        );

        response.cookies.set("showSubscriptionModal", "true", {
          path: "/",
          maxAge: 60 * 5,
        });

        return response;
      }

      // Redirect authenticated users away from auth pages
      if (isPublicPath && allStepsCompleted) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }
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
