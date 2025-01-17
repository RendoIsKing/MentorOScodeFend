"use client";
import InboxBody from "@/components/inbox-body";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

export default function InboxPageResponsive() {
  const userData = useUserOnboardingContext();

  if (!userData) return <div>Loading.......</div>;

  return (
    <>
      <div className="h-screen">
        <InboxBody />
      </div>
    </>
  );
}
