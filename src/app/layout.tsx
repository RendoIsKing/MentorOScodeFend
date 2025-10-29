"use client";
import { useEffect, useLayoutEffect } from "react";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Provider } from "react-redux";
import "./globals.css";
import { useRouter } from "next/navigation";
import store from "@/redux/store";
import { NotificationBannerContextProvider } from "@/context/NotificationBanner";
import { UserOnboardingContextProvider } from "@/context/UserOnboarding";
import { Toaster } from "@/components/ui/toaster";
import { ScreenOrientationProvider } from "@/context/ScreenOrientation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { HomeHeaderFilterProvider } from "@/context/HomeFeedHeader";
import PostModalProvider from "@/context/PostModal";
import UserTagsContextProvider from "@/context/UserTags";
import CountryCodeProvider from "@/context/countryCodeContext";
import useFCM from "@/utils/hooks/useFCM";
import { useUpdateFCMTokenMutation } from "@/redux/services/haveme/notifications";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import type { Viewport } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";

const fontNormal = Manrope({ subsets: ["latin"], weight: ["400"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
  postslot,
}: {
  children: React.ReactNode;
  postslot: React.ReactNode;
}) {
  const router = useRouter();
  function PushInit(){
    const { fcmToken } = useFCM();
    const [update] = useUpdateFCMTokenMutation();
    useEffect(()=>{ if (fcmToken) update({ fcm_token: fcmToken }).catch(()=>{}); }, [fcmToken]);
    return null;
  }

  useEffect(() => {
    document.title = "Mentorio";
  }, []);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
  const MobileTabBar = dynamic(() => import("@/components/mobile/MobileTabBar"), { ssr: false });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/assets/brand/mentorio-m-gold.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-background theme-yellow">
        <main className={`${fontNormal.className}`}>
          <Provider store={store}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                  <Elements stripe={stripePromise}>
                    <HomeHeaderFilterProvider>
                      <ScreenOrientationProvider>
                        <UserOnboardingContextProvider>
                          <NotificationBannerContextProvider>
                            <PostModalProvider>
                              <UserTagsContextProvider>
                                <CountryCodeProvider>
                                <PushInit />
                                <div className="absolute top-20 z-50 opacity-50 right-0">
                                  <ModeToggle />
                                </div>
                                <div className="pb-tabbar md:pb-0">
                                  <ErrorBoundary fallback={<div className="p-4 text-muted-foreground text-sm">Kunne ikke laste. Prøv å oppdatere.</div>}>
                                    {postslot}
                                    {children}
                                  </ErrorBoundary>
                                </div>
                                <MobileTabBar />
                                <Toaster />
                                </CountryCodeProvider>
                              </UserTagsContextProvider>
                            </PostModalProvider>
                          </NotificationBannerContextProvider>
                        </UserOnboardingContextProvider>
                      </ScreenOrientationProvider>
                    </HomeHeaderFilterProvider>
                  </Elements>
                </GoogleOAuthProvider>
              ) : (
                <Elements stripe={stripePromise}>
                  <HomeHeaderFilterProvider>
                    <ScreenOrientationProvider>
                      <UserOnboardingContextProvider>
                        <NotificationBannerContextProvider>
                          <PostModalProvider>
                            <UserTagsContextProvider>
                              <CountryCodeProvider>
                              <PushInit />
                              <div className="absolute top-20 z-50 opacity-50 right-0">
                                <ModeToggle />
                              </div>
                              <div className="pb-tabbar md:pb-0">
                                <ErrorBoundary fallback={<div className="p-4 text-muted-foreground text-sm">Kunne ikke laste. Prøv å oppdatere.</div>}>
                                  {postslot}
                                  {children}
                                </ErrorBoundary>
                              </div>
                              <MobileTabBar />
                              <Toaster />
                              </CountryCodeProvider>
                            </UserTagsContextProvider>
                          </PostModalProvider>
                        </NotificationBannerContextProvider>
                      </UserOnboardingContextProvider>
                    </ScreenOrientationProvider>
                  </HomeHeaderFilterProvider>
                </Elements>
              )}
            </ThemeProvider>
          </Provider>
        </main>
      </body>
    </html>
  );
}
