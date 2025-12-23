"use client";

import ProfileBody from "@/components/profile-body";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";

export default function ProfileBodyPage() {
  const router = useRouter();
  const params = useParams() as any;
  const uid = String(params?.uid || "");
  const { data: userRes } = useGetUserDetailsByUserNameQuery({ userName: uid } as any, { skip: !uid });
  const targetRaw = (userRes as any)?.data ?? {};

  // Cutover flag: enable new design profile on the real /[uid] route.
  React.useEffect(() => {
    const designEnabled =
      String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1" ||
      String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";
    if (!designEnabled) return;
    if (!uid) return;
    const isMentor = Boolean(targetRaw?.isMentor);
    router.replace(`/feature/design/${isMentor ? "mentor" : "u"}/${encodeURIComponent(uid)}`);
  }, [router, uid, targetRaw?.isMentor]);

  // Cutover flag: enable new ui-v2 profile on the real /[uid] route.
  React.useEffect(() => {
    // Design takes precedence.
    const designEnabled =
      String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1" ||
      String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";
    if (designEnabled) return;

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
