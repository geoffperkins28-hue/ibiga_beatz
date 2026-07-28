import DashboardView from "@/components/views/DashboardView";
import { requireUser } from "@/lib/auth";
import {
  getBeats,
  getSongs,
  getDashStats,
  getClients,
  getRequests,
  getBookings,
  getOrders,
  getProfile,
} from "@/lib/data";

// Admin data is request-time (and gated by middleware + a server-side check).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireUser();
  const [beats, songs, stats, clients, requests, bookings, orders, profile] =
    await Promise.all([
      getBeats(),
      getSongs(),
      getDashStats(),
      getClients(),
      getRequests(),
      getBookings(),
      getOrders(),
      getProfile(),
    ]);

  return (
    <DashboardView
      profile={profile}
      beats={beats}
      songs={songs}
      stats={stats}
      clients={clients}
      requests={requests}
      bookings={bookings}
      orders={orders}
    />
  );
}
