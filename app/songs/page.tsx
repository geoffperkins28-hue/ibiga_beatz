import SongsView from "@/components/views/SongsView";
import { getSongs } from "@/lib/data";

export default async function SongsPage() {
  const songs = await getSongs();
  return <SongsView songs={songs} />;
}
