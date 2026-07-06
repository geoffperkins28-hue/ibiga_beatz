"use client";

import { useState } from "react";
import { Search, Play, Pause, Heart, Music } from "lucide-react";
import type { Beat } from "@/lib/types";
import { genres as baseGenres } from "@/lib/constants";
import { formatNaira } from "@/lib/format";
import { usePlayer } from "@/lib/player";

export default function StoreView({ beats, initialSearch = "" }: { beats: Beat[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState("All");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const { current, playing, play, toggle } = usePlayer();

  // Genre chips: keep the familiar order, then append any real beat genre
  // that isn't already listed (e.g. a producer's brand-new genre like "Highlife").
  const genreChips = [
    ...baseGenres,
    ...Array.from(new Set(beats.map((b) => b.genre).filter(Boolean))).filter((g) => !baseGenres.includes(g)),
  ];

  const filtered = beats.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.title.toLowerCase().includes(q) || (b.genre ?? "").toLowerCase().includes(q);
    const matchGenre = genre === "All" || b.genre === genre;
    return matchSearch && matchGenre;
  });

  const onPlay = (beat: Beat) => {
    if (current?.id === beat.id) toggle();
    else play(beat, filtered);
  };

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
          {genreChips.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
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
        {filtered.map((beat) => {
          const isPlaying = current?.id === beat.id && playing;
          return (
            <div key={beat.id} className="relative">
              <div
                className="bg-card rounded-2xl overflow-hidden border border-border hover:bg-[#282828] transition-all duration-200 cursor-pointer group"
                onClick={() => onPlay(beat)}
              >
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={beat.image} alt={beat.title} className={`w-full h-full object-cover ${beat.sold ? "opacity-60" : ""}`} />
                  {beat.sold && (
                    <div className="absolute top-2 right-2 bg-black/80 text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded-full">
                      Sold
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
                      {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {beat.genre} · {beat.bpm} BPM · {beat.mood}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-[#1DB954]">{formatNaira(beat.price)}</span>
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
                        disabled={beat.sold}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          beat.sold
                            ? "bg-[#282828] text-muted-foreground cursor-not-allowed"
                            : "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                        }`}
                      >
                        {beat.sold ? "Sold" : "Buy"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Music size={32} className="mx-auto mb-3 opacity-40" />
          <p>No beats found for &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
