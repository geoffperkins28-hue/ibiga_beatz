import PortfolioView from "@/components/views/PortfolioView";
import { getProfile } from "@/lib/data";

export default async function PortfolioPage() {
  const profile = await getProfile();
  return <PortfolioView profile={profile} />;
}
