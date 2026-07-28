import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BeatDetailView from "@/components/views/BeatDetailView";
import { getBeatById, getRelatedBeats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const beat = await getBeatById(id);
  if (!beat) return { title: "Beat not found" };
  return {
    title: `${beat.title} — ${beat.genre} beat`,
    description: `${beat.title}: ${beat.genre} · ${beat.bpm} BPM${beat.key ? ` · ${beat.key}` : ""}. Exclusive beat by Ibiga Beatz.`,
  };
}

export default async function BeatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const beat = await getBeatById(id);
  if (!beat) notFound();
  const related = await getRelatedBeats(beat, 4);
  return <BeatDetailView beat={beat} related={related} />;
}
