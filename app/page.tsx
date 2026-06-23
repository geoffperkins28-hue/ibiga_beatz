import HomeView from "@/components/views/HomeView";
import { getBeats, getSongs, getProfile } from "@/lib/data";

export default async function HomePage() {
  const [beats, songs, profile] = await Promise.all([
    getBeats(),
    getSongs(),
    getProfile(),
  ]);
  return <HomeView beats={beats} songs={songs} profile={profile} />;
}
