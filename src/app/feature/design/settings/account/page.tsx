import { redirect } from "next/navigation";

// We already have a full design Edit Profile flow; reuse it for "Account Settings".
export default function DesignAccountSettingsPage() {
  redirect("/feature/design/edit-profile");
}


