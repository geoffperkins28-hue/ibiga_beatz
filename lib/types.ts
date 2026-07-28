export interface ProducerProfile {
  displayName: string;
  fullName: string;
  role: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  heroImageUrl: string;
}

export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  mood: string;
  price: number;
  duration: string;
  plays: number;
  image: string;
  audioUrl?: string | null;
  sold?: boolean;
  key?: string;
  notes?: string;
}

export type Platform = "spotify" | "youtube" | "apple";

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  platform: Platform;
  link: string;
  year: number;
  featured?: boolean;
}

export interface DashStat {
  label: string;
  value: string;
  icon: string; // lucide icon key, resolved in the view
  change: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  amount: string;
  orders: number;
  date: string;
}

export type RequestStatus =
  | "New"
  | "Under Review"
  | "Accepted"
  | "In Progress"
  | "Completed"
  | "Rejected";

export interface CustomRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  genre: string;
  bpm: number;
  mood: string;
  refArtist: string;
  deadline: string;
  budget: string;
  notes: string;
  voiceUrl: string | null;
  status: RequestStatus;
  date: string;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: BookingStatus;
}
