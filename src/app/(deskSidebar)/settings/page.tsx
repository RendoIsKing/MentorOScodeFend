import Settings from "@/components/setting/settings";
import InnerPageHeader from "@/components/shared/inner-page-header";

export default function settingsPage() {
  return (
    <>
      <InnerPageHeader title="Settings " showBackButton={false} />
      <div className="lg:py-8 h-screen">
      <Settings />
      </div>
    </>
  );
}
