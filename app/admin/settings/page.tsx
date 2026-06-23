import ProfileSettings from "@/components/views/ProfileSettings";
import { getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  return <ProfileSettings profile={profile} />;
}
