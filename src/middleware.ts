import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { notFound } from "next/navigation";

// authenticated user means he has token
// logged in user means user is on boarded and completed all the steps
// verified means user's docs are verified and can view other contents on the site

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

  if (
    !userAuthToken &&
    request.nextUrl.pathname !== "/signup" &&
    request.nextUrl.pathname !== "/verify-otp" &&
    request.nextUrl.pathname !== "/signin" &&
    request.nextUrl.pathname !== "/admin"
  ) {
    const signupUrl = new URL("/signup", process.env.NEXT_PUBLIC_DOMAIN);
    return NextResponse.redirect(signupUrl);
  } else if (userAuthToken?.value) {
    const userProgress = await getUserProgress(userAuthToken.value);
    const currentPath = request.nextUrl.pathname;
    const isAdmin = userProgress?.data?.role === "admin" ? true : false;
    if (isAdmin) {
      if (!currentPath.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL("/admin/dashboard", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }
    } else {
      if (currentPath.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }
      const pathsAndChecks = [
        { path: "/user-info", check: userProgress.data.hasPersonalInfo },
        { path: "/user-photo", check: userProgress.data.hasPhotoInfo },
        { path: "/user-tags", check: userProgress.data.hasSelectedInterest },
        { path: "/age-confirmation", check: userProgress.data.hasConfirmedAge },
        {
          path: "/age-confirmation",
          check: userProgress.data.hasDocumentUploaded,
        },
      ];

      const allStepsCompleted = pathsAndChecks.every(
        (element) => element.check
      );

      // If all steps are completed, redirect the user
      if (
        allStepsCompleted &&
        pathsAndChecks.some((pathCheck) => pathCheck.path === currentPath)
      ) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }

      for (const element of pathsAndChecks) {
        if (element.path === currentPath && !element.check) {
          // User is on the correct page but hasn't completed it
          break;
        } else if (!element.check) {
          // Find the first incomplete step
          return NextResponse.redirect(
            new URL(element.path, process.env.NEXT_PUBLIC_DOMAIN)
          );
        }
      }

      const verifiedOnlyPaths = [
        "/chat",
        "/creator-center",
        "/search",
        "/wallet",
      ];

      if (
        !userProgress?.data?.hasDocumentVerified &&
        verifiedOnlyPaths.some((path) => currentPath.startsWith(path))
      ) {
        return NextResponse.redirect(
          new URL("/home", process.env.NEXT_PUBLIC_DOMAIN)
        );
      }

      if (
        currentPath === "/signup" ||
        currentPath === "/signin" ||
        currentPath === "/verify-otp" ||
        currentPath === "/admin"
      ) {
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
