import ProfileSettings from "@/components/views/ProfileSettings";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();
  const profile = await getProfile();
  return <ProfileSettings profile={profile} />;
}
