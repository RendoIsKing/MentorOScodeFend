import MoreProfileSettings from "@/components/more-profile-settings";
import InnerPageHeader from "@/components/shared/inner-page-header";

export default function MoreProfileSettingsPage() {
  return (
    <>
      <div className="h-screen">
        <InnerPageHeader showBackButton={true} title="More" />
        <MoreProfileSettings />
      </div>
    </>
  );
}
