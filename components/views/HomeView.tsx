import Link from "next/link";
import { ChevronRight, Headphones, Zap, Award, Music, ShoppingBag, Mic, Calendar } from "lucide-react";
import type { Beat, Song, ProducerProfile } from "@/lib/types";
import BeatCard from "@/components/BeatCard";
import SongCard from "@/components/SongCard";

const ctas = [
  { href: "/store", icon: ShoppingBag, label: "Buy Beats", desc: "Browse the store" },
  { href: "/request", icon: Mic, label: "Custom Request", desc: "Commission a beat" },
  { href: "/booking", icon: Calendar, label: "Book Session", desc: "Studio & mixing" },
];

export default function HomeView({
  beats,
  songs,
  profile,
}: {
  beats: Beat[];
  songs: Song[];
  profile: ProducerProfile;
}) {
  return (
    <div className="space-y-8">
      {/* Hero — the producer's own image */}
      <div className="relative rounded-3xl overflow-hidden h-72 md:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.heroImageUrl}
          alt={profile.displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
          <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest mb-2">
            Verified Producer
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {profile.displayName}
          </h1>
          <p className="text-white/80 max-w-md mt-3 text-sm md:text-base">{profile.tagline}</p>
        </div>
      </div>

      {/* Call-to-action row — below the hero, left to right */}
      <div className="grid grid-cols-3 gap-3">
        {ctas.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-2 md:gap-3 rounded-2xl px-3 py-4 md:px-5 transition-colors border ${
              i === 0
                ? "bg-[#1DB954] border-[#1DB954] text-black hover:bg-[#1ed760]"
                : "bg-card border-border text-white hover:bg-[#282828]"
            }`}
          >
            <c.icon size={20} className={i === 0 ? "text-black shrink-0" : "text-[#1DB954] shrink-0"} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight">{c.label}</span>
              <span className={`hidden md:block text-xs ${i === 0 ? "text-black/70" : "text-muted-foreground"}`}>
                {c.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Beats Produced", value: "500+" },
          { label: "Artists Worked With", value: "120+" },
          { label: "Years Active", value: "10" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-5 text-center border border-border">
            <p className="text-2xl font-bold text-[#1DB954]">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Featured Beats */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Featured Beats</h2>
          <Link href="/store" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {beats.slice(0, 4).map((beat) => (
            <BeatCard key={beat.id} beat={beat} queue={beats.slice(0, 4)} />
          ))}
        </div>
      </section>

      {/* Latest Work */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Latest Productions</h2>
          <Link href="/songs" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {songs.slice(0, 3).map((song) => (
            <Link key={song.id} href="/songs">
              <SongCard song={song} />
            </Link>
          ))}
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="text-xl font-bold text-white mb-5">Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Headphones, label: "Beat Production", desc: "Custom crafted to your vision" },
            { icon: Zap, label: "Mixing", desc: "Radio-ready sound quality" },
            { icon: Award, label: "Mastering", desc: "Professional final polish" },
            { icon: Music, label: "Consultation", desc: "One-on-one creative sessions" },
          ].map((svc) => (
            <div key={svc.label} className="bg-card border border-border rounded-2xl p-5 hover:bg-[#282828] transition-colors cursor-pointer group">
              <svc.icon size={24} className="text-[#1DB954] mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white text-sm">{svc.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
