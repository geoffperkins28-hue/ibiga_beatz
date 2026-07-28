export const genres = [
  "All",
  "Afrobeats",
  "Afropop",
  "Amapiano",
  "Trap",
  "R&B",
  "Hip-Hop",
];

export const requestGenres = [
  "Afrobeats",
  "Amapiano",
  "R&B",
  "Hip-Hop",
  "Trap",
  "Afropop",
  "Drill",
];

export const services = [
  "Studio Session",
  "Beat Production",
  "Mixing",
  "Mastering",
  "Consultation",
];

export const statusColors: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-400",
  "Under Review": "bg-purple-500/20 text-purple-400",
  "In Progress": "bg-yellow-500/20 text-yellow-400",
  Accepted: "bg-green-500/20 text-green-400",
  Completed: "bg-[#1DB954]/20 text-[#1DB954]",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Confirmed: "bg-[#1DB954]/20 text-[#1DB954]",
  Fulfilled: "bg-[#1DB954]/20 text-[#1DB954]",
  Cancelled: "bg-red-500/20 text-red-400",
  Rejected: "bg-red-500/20 text-red-400",
};

export const platformColors: Record<string, string> = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  apple: "#FA57C1",
};
