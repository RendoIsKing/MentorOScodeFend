"use client";
import { useEffect, useLayoutEffect } from "react";
import { ABeeZee } from "next/font/google";
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

const fontNormal = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "normal",
});

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
    // Set document title and other metadata directly
    document.title = "MentorOS";
    // You can also manipulate other metadata properties here
  }, []);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
  const MobileTabBar = dynamic(() => import("@/components/mobile/MobileTabBar"), { ssr: false });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-background">
        <main className={`${fontNormal.className}`}>
          <Provider store={store}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
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
                            {postslot}
                            {children}
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
            </ThemeProvider>
          </Provider>
        </main>
      </body>
    </html>
  );
}
