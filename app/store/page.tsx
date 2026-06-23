import StoreView from "@/components/views/StoreView";
import { getBeats } from "@/lib/data";

export default async function StorePage() {
  const beats = await getBeats();
  return <StoreView beats={beats} />;
}
