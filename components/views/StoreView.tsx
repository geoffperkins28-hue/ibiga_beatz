"use client";

import { useState } from "react";
import { Search, Play, Pause, Heart, Music } from "lucide-react";
import type { Beat } from "@/lib/types";
import { genres } from "@/lib/constants";
import MiniPlayer from "@/components/MiniPlayer";

export default function StoreView({ beats }: { beats: Beat[] }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [playingBeat, setPlayingBeat] = useState<Beat | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = beats.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q);
    const matchGenre = genre === "All" || b.genre === genre;
    return matchSearch && matchGenre;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Beat Store</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse, preview and purchase exclusive beats
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beats..."
            className="w-full bg-[#282828] border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                genre === g ? "bg-[#1DB954] text-black" : "bg-[#282828] text-muted-foreground hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Beat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((beat) => (
          <div key={beat.id} className="relative">
            <div
              className="bg-card rounded-2xl overflow-hidden border border-border hover:bg-[#282828] transition-all duration-200 cursor-pointer group"
              onClick={() => setPlayingBeat(playingBeat?.id === beat.id ? null : beat)}
            >
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={beat.image} alt={beat.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
                    {playingBeat?.id === beat.id ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {beat.genre} · {beat.bpm} BPM · {beat.mood}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-[#1DB954]">${beat.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked((prev) => {
                          const n = new Set(prev);
                          if (n.has(beat.id)) n.delete(beat.id);
                          else n.add(beat.id);
                          return n;
                        });
                      }}
                      className="text-muted-foreground hover:text-white transition-colors"
                      aria-label="Like"
                    >
                      <Heart
                        size={14}
                        fill={liked.has(beat.id) ? "#1DB954" : "none"}
                        className={liked.has(beat.id) ? "text-[#1DB954]" : ""}
                      />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 rounded-full bg-[#1DB954] text-black text-xs font-semibold hover:bg-[#1ed760] transition-colors"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Music size={32} className="mx-auto mb-3 opacity-40" />
          <p>No beats found for &quot;{search}&quot;</p>
        </div>
      )}

      {playingBeat && <MiniPlayer beat={playingBeat} onClose={() => setPlayingBeat(null)} />}
    </div>
  );
}
