import type { Metadata } from "next";
import SongsView from "@/components/views/SongsView";
import { getSongs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Productions",
  description: "Stream songs produced or co-produced by Ibiga Beatz — right here, no app-switching.",
};

// Always render with the live songs list (new/reordered songs appear immediately).
export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const songs = await getSongs();
  return <SongsView songs={songs} />;
}
