import type { Metadata } from "next";
import StoreView from "@/components/views/StoreView";
import { getBeats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Beat Store",
  description: "Browse, preview and buy exclusive Afrobeats, Amapiano, Trap and R&B beats from Ibiga Beatz.",
};

// Always render with the live catalogue (new beats appear immediately).
export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [beats, params] = await Promise.all([getBeats(), searchParams]);
  return <StoreView beats={beats} initialSearch={params.q ?? ""} />;
}
