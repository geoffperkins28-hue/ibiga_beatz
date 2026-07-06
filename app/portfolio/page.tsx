import type { Metadata } from "next";
import PortfolioView from "@/components/views/PortfolioView";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "The story, craft and credentials of Ibiga Beatz — Afrobeats, Amapiano, R&B and Trap producer.",
};

// Always render with the live producer profile (edits appear immediately).
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const profile = await getProfile();
  return <PortfolioView profile={profile} />;
}
