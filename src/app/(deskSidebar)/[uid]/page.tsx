"use client";

import ProfileBody from "@/components/profile-body";
import React from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProfileBodyPage() {
  const router = useRouter();
  const params = useParams() as any;
  const uid = String(params?.uid || "");

  // Cutover flag: enable new ui-v2 profile on the real /[uid] route.
  React.useEffect(() => {
    const enabled =
      String(process.env.NEXT_PUBLIC_UI_V2 || "") === "1" ||
      String(process.env.NEXT_PUBLIC_UI_V2_PROFILE || "") === "1";
    if (!enabled) return;
    if (!uid) return;
    router.replace(`/feature/ui-v2/u/${encodeURIComponent(uid)}`);
  }, [router, uid]);

  return (
    <>
      <ProfileBody />
    </>
  );
}
