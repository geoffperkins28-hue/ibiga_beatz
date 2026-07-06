import HomeView from "@/components/views/HomeView";
import { getBeats, getSongs, getProfile } from "@/lib/data";

// Always render with live catalogue data (never a stale static snapshot).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [beats, songs, profile] = await Promise.all([
    getBeats(),
    getSongs(),
    getProfile(),
  ]);
  return <HomeView beats={beats} songs={songs} profile={profile} />;
}
