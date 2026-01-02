import Settings from "@/components/setting/settings";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { redirect } from "next/navigation";

export default function settingsPage() {
  const designEnabled =
    String(process.env.NEXT_PUBLIC_DESIGN || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN_PROFILE || "") === "1";
  if (designEnabled) {
    redirect("/feature/design/settings");
  }
  return (
    <>
      <InnerPageHeader title="Settings " showBackButton={true} />
      <div className="lg:py-8 h-screen">
      <Settings />
      </div>
    </>
  );
}
