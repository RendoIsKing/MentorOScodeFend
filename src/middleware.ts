import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function getUserProgress(userAuthToken: string) {
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
}

export async function middleware(request: NextRequest) {
  const userAuthToken = request.cookies.get("auth_token");

  // Public paths that don't require authentication
  const publicPaths = [
    "/signup",
    "/verify-otp",
    "/signin",
    "/forgotpassword",
    "/admin",
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // If no token and trying to access protected route
  if (!userAuthToken && !isPublicPath) {
    const signupUrl = new URL("/signup", process.env.NEXT_PUBLIC_DOMAIN);
    return NextResponse.redirect(signupUrl);
  }

  if (userAuthToken?.value) {
    const userProgress = await getUserProgress(userAuthToken.value);
    const currentPath = request.nextUrl.pathname;
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

      const allStepsCompleted = pathsAndChecks.every(
        (element) => element.check
      );

      // Routes that require subscription
      const subscriptionRequiredPaths = [
        "/chat",
        "/creator-center",
        "/search",
        "/wallet",
      ];

      // Check if current path requires subscription
      const requiresSubscription = subscriptionRequiredPaths.some((path) =>
        currentPath.startsWith(path)
      );

      // If path requires subscription and user doesn't have active subscription
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

      // If user has subscription but tries to access onboarding steps
      if (
        allStepsCompleted &&
        pathsAndChecks.some((pathCheck) => pathCheck.path === currentPath)
      ) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }

      // Check and redirect for incomplete steps
      for (const element of pathsAndChecks) {
        if (element.path === currentPath && !element.check) {
          break;
        } else if (!element.check) {
          return NextResponse.redirect(
            new URL(element.path, process.env.NEXT_PUBLIC_DOMAIN)
          );
        }
      }

      // Redirect authenticated users away from auth pages
      if (publicPaths.includes(currentPath)) {
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
