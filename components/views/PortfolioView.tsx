import { Award, TrendingUp, Users, Star } from "lucide-react";
import type { ProducerProfile } from "@/lib/types";

const achievements = [
  { icon: Award, text: "2x Afrobeats Producer of the Year — Nigeria Music Awards" },
  { icon: TrendingUp, text: "Over 50M streams on produced tracks globally" },
  { icon: Users, text: "Collaborated with 120+ independent and major label artists" },
  { icon: Star, text: "Featured in Beats by Dre Africa campaign (2023)" },
];

export default function PortfolioView({ profile }: { profile: ProducerProfile }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-muted-foreground text-sm mt-1">The story, the craft, the credentials</p>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-[#1DB954]/30 via-[#1a1a2e] to-[#282828] relative">
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-24 h-24 rounded-full border-4 border-card object-cover"
            />
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
          <p className="text-[#1DB954] text-sm font-semibold mt-1">{profile.role}</p>
          <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-2xl whitespace-pre-line">
            {profile.bio}
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {["Afrobeats", "Amapiano", "R&B", "Trap", "Hip-Hop", "Drill", "Afropop"].map((g) => (
              <span key={g} className="px-3 py-1 rounded-full bg-[#282828] text-xs text-muted-foreground border border-border">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
              <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center shrink-0">
                <a.icon size={18} className="text-[#1DB954]" />
              </div>
              <p className="text-sm text-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Services Offered</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Beat Production", from: "$49" },
            { name: "Custom Beat (exclusive)", from: "$299" },
            { name: "Mixing & Mastering", from: "$150" },
            { name: "Studio Session (2hrs)", from: "$200" },
            { name: "Beat Subscription", from: "$99/mo" },
            { name: "Artist Consultation", from: "$75/hr" },
          ].map((s) => (
            <div key={s.name} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
              <span className="text-sm text-white font-medium">{s.name}</span>
              <span className="text-xs text-[#1DB954] font-semibold">From {s.from}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Connect</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Spotify" },
            { name: "YouTube" },
            { name: "Instagram" },
            { name: "Twitter / X" },
            { name: "SoundCloud" },
          ].map((l) => (
            <a key={l.name} href="#" className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-colors">
              {l.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
