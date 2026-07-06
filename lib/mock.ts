import type {
  Beat,
  Song,
  DashStat,
  Client,
  CustomRequest,
  Booking,
  ProducerProfile,
} from "./types";

export const defaultProfile: ProducerProfile = {
  displayName: "Ibiga Beatz",
  fullName: "Ibiga Okonkwo",
  role: "Music Producer · Sound Engineer",
  tagline:
    "Crafting hits across Afrobeats, Amapiano & R&B since 2016. Lagos-born, globally heard.",
  bio: "Born in Lagos, raised on rhythms from across Africa, Ibiga Okonkwo has been shaping the sound of the continent since 2016. Known for fusing traditional percussion with modern 808s and lush synthesizers, he creates beats that move bodies and tell stories. His work spans Afrobeats, Amapiano, R&B, and Trap — always rooted in authentic African expression.",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop&auto=format",
  heroImageUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=700&fit=crop&auto=format",
};

// Mock data — used as a fallback until Supabase is configured (or a table is
// empty). Once NEXT_PUBLIC_SUPABASE_URL / keys are set and tables have rows,
// the data layer in lib/data.ts pulls from Supabase instead.

export const mockBeats: Beat[] = [
  { id: "1", title: "Midnight Wave", genre: "Afrobeats", bpm: 102, mood: "Dark", price: 49000, duration: "2:45", plays: 3842, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&auto=format" },
  { id: "2", title: "Lagos Nights", genre: "Afropop", bpm: 98, mood: "Vibes", price: 75000, duration: "3:12", plays: 7210, image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop&auto=format" },
  { id: "3", title: "Gold Rush", genre: "Trap", bpm: 140, mood: "Aggressive", price: 89000, duration: "2:58", plays: 5430, image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop&auto=format" },
  { id: "4", title: "Ocean Drive", genre: "R&B", bpm: 85, mood: "Chill", price: 59000, duration: "3:30", plays: 4120, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&auto=format" },
  { id: "5", title: "Savanna Dusk", genre: "Afrobeats", bpm: 110, mood: "Euphoric", price: 69000, duration: "2:22", plays: 9034, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&auto=format" },
  { id: "6", title: "Street Anthem", genre: "Hip-Hop", bpm: 92, mood: "Hard", price: 95000, duration: "3:05", plays: 6700, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop&auto=format" },
  { id: "7", title: "Neon Pulse", genre: "Amapiano", bpm: 115, mood: "Party", price: 79000, duration: "4:10", plays: 11250, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&auto=format" },
  { id: "8", title: "Whisper", genre: "R&B", bpm: 72, mood: "Romantic", price: 55000, duration: "3:48", plays: 2980, image: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=400&h=400&fit=crop&auto=format" },
];

export const mockSongs: Song[] = [
  { id: "1", title: "No Pressure", artist: "Burna Boy", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&auto=format", platform: "spotify", link: "#", year: 2023 },
  { id: "2", title: "Rush", artist: "Ayra Starr", cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop&auto=format", platform: "spotify", link: "#", year: 2023 },
  { id: "3", title: "Essence", artist: "Wizkid ft. Tems", cover: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&h=300&fit=crop&auto=format", platform: "youtube", link: "#", year: 2022 },
  { id: "4", title: "Last Last", artist: "Burna Boy", cover: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop&auto=format", platform: "apple", link: "#", year: 2022 },
  { id: "5", title: "Diana", artist: "Kizz Daniel", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&auto=format", platform: "spotify", link: "#", year: 2023 },
];

export const mockDashStats: DashStat[] = [
  { label: "Beat Sales", value: "₦485,200", icon: "DollarSign", change: "+23%" },
  { label: "Total Orders", value: "142", icon: "ShoppingBag", change: "+18%" },
  { label: "Custom Requests", value: "28", icon: "Mic", change: "+5%" },
  { label: "Bookings", value: "17", icon: "Calendar", change: "+12%" },
];

export const mockClients: Client[] = [
  { id: "1", name: "David Okon", email: "david@example.com", amount: "₦95,000", orders: 3, date: "Jun 18" },
  { id: "2", name: "Amara Nwosu", email: "amara@example.com", amount: "₦49,000", orders: 1, date: "Jun 15" },
  { id: "3", name: "Kofi Mensah", email: "kofi@example.com", amount: "₦148,000", orders: 4, date: "Jun 12" },
  { id: "4", name: "Zainab Yusuf", email: "zainab@example.com", amount: "₦75,000", orders: 2, date: "Jun 10" },
  { id: "5", name: "Emeka Eze", email: "emeka@example.com", amount: "₦55,000", orders: 1, date: "Jun 8" },
];

const reqDefaults = { email: "", phone: "", mood: "", refArtist: "", deadline: "", notes: "", voiceUrl: null };

export const mockRequests: CustomRequest[] = [
  { id: "1", name: "Tunde Bakare", genre: "Afrobeats", bpm: 105, budget: "₦80,000", status: "New", date: "Jun 20", ...reqDefaults },
  { id: "2", name: "Chiamaka Obi", genre: "R&B", bpm: 88, budget: "₦60,000", status: "In Progress", date: "Jun 17", ...reqDefaults },
  { id: "3", name: "Seun Adeyemi", genre: "Amapiano", bpm: 112, budget: "₦120,000", status: "Accepted", date: "Jun 14", ...reqDefaults },
  { id: "4", name: "Blessing Nnaji", genre: "Hip-Hop", bpm: 140, budget: "₦45,000", status: "Completed", date: "Jun 9", ...reqDefaults },
];

const bookDefaults = { email: "", phone: "", notes: "" };

export const mockBookings: Booking[] = [
  { id: "1", name: "Rashid Aliyu", service: "Mixing", date: "Jun 25, 2026", time: "2:00 PM", status: "Confirmed", ...bookDefaults },
  { id: "2", name: "Fatima Sule", service: "Studio Session", date: "Jun 28, 2026", time: "10:00 AM", status: "Pending", ...bookDefaults },
  { id: "3", name: "Mike Oladele", service: "Mastering", date: "Jul 2, 2026", time: "4:00 PM", status: "Confirmed", ...bookDefaults },
];
