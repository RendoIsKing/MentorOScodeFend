 "use client";
import React from "react";
import CreatorCenter from "@/components/creator-center";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

function CreateCenterPage() {
  const router = useRouter();
  const { data: meRes } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};

  React.useEffect(() => {
    const designEnabled =
      String(process.env.NEXT_PUBLIC_DESIGN || "") === "1" ||
      String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1";
    if (!designEnabled) return;
    if (!Boolean(me?.isMentor)) return;
    router.replace("/feature/design/mentor-dashboard");
  }, [router, me?.isMentor]);

  return (
    <div className="relative">
      <CreatorCenter />
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="rounded-xl border bg-card px-6 py-4 shadow">
          <h2 className="text-xl font-semibold">Creator Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
export default CreateCenterPage;

