import DashboardView from "@/components/views/DashboardView";
import {
  getBeats,
  getSongs,
  getDashStats,
  getClients,
  getRequests,
  getBookings,
  getProfile,
} from "@/lib/data";

// Admin data is request-time (and gated by middleware auth).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [beats, songs, stats, clients, requests, bookings, profile] =
    await Promise.all([
      getBeats(),
      getSongs(),
      getDashStats(),
      getClients(),
      getRequests(),
      getBookings(),
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
    />
  );
}
