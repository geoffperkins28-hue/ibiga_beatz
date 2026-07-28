"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Play, Pause, Heart, Music, SlidersHorizontal } from "lucide-react";
import type { Beat } from "@/lib/types";
import { genres as baseGenres } from "@/lib/constants";
import { priceLabel } from "@/lib/format";
import { usePlayer } from "@/lib/player";

export default function StoreView({ beats, initialSearch = "" }: { beats: Beat[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState("All");
  const [mood, setMood] = useState("All");
  const [bpmMin, setBpmMin] = useState("");
  const [bpmMax, setBpmMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const { current, playing, play, toggle } = usePlayer();

  // Chips/options derived from real beats so producer-added genres/moods appear.
  const genreChips = [
    ...baseGenres,
    ...Array.from(new Set(beats.map((b) => b.genre).filter(Boolean))).filter((g) => !baseGenres.includes(g)),
  ];
  const moods = ["All", ...Array.from(new Set(beats.map((b) => b.mood).filter(Boolean)))];

  const filtered = beats.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.title.toLowerCase().includes(q) || (b.genre ?? "").toLowerCase().includes(q) || (b.mood ?? "").toLowerCase().includes(q);
    const matchGenre = genre === "All" || b.genre === genre;
    const matchMood = mood === "All" || b.mood === mood;
    const matchBpm = (!bpmMin || b.bpm >= Number(bpmMin)) && (!bpmMax || b.bpm <= Number(bpmMax));
    const matchPrice = (!priceMin || b.price >= Number(priceMin)) && (!priceMax || b.price <= Number(priceMax));
    return matchSearch && matchGenre && matchMood && matchBpm && matchPrice;
  });

  const activeFilters =
    (mood !== "All" ? 1 : 0) + (bpmMin || bpmMax ? 1 : 0) + (priceMin || priceMax ? 1 : 0);

  const onPlay = (e: React.MouseEvent, beat: Beat) => {
    e.preventDefault();
    e.stopPropagation();
    if (current?.id === beat.id) toggle();
    else play(beat, filtered);
  };

  const clearFilters = () => {
    setMood("All");
    setBpmMin("");
    setBpmMax("");
    setPriceMin("");
    setPriceMax("");
  };

  const numCls = "w-full bg-[#282828] border border-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Beat Store</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse, preview and buy exclusive beats</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beats..."
            className="w-full bg-[#282828] border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shrink-0 ${
            showFilters || activeFilters ? "bg-[#1DB954] text-black" : "bg-[#282828] text-muted-foreground hover:text-white"
          }`}
        >
          <SlidersHorizontal size={15} /> Filters{activeFilters ? ` · ${activeFilters}` : ""}
        </button>
      </div>

      {/* Genre chips */}
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

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mood</p>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className={numCls}>
              {moods.map((m) => (
                <option key={m} value={m} className="bg-[#282828]">{m}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">BPM range</p>
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" value={bpmMin} onChange={(e) => setBpmMin(e.target.value)} placeholder="Min" className={numCls} />
              <span className="text-muted-foreground">–</span>
              <input type="number" inputMode="numeric" value={bpmMax} onChange={(e) => setBpmMax(e.target.value)} placeholder="Max" className={numCls} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Price (₦)</p>
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" className={numCls} />
              <span className="text-muted-foreground">–</span>
              <input type="number" inputMode="numeric" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" className={numCls} />
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-[#1DB954] hover:underline text-left sm:col-span-3 w-max">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Beat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((beat) => {
          const isPlaying = current?.id === beat.id && playing;
          return (
            <Link
              key={beat.id}
              href={`/store/${beat.id}`}
              className="block bg-card rounded-2xl overflow-hidden border border-border hover:bg-[#282828] transition-all duration-200 group"
            >
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={beat.image} alt={beat.title} className={`w-full h-full object-cover ${beat.sold ? "opacity-60" : ""}`} />
                {beat.isFree ? (
                  <div className="absolute top-2 right-2 bg-[#1DB954] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Free</div>
                ) : beat.sold ? (
                  <div className="absolute top-2 right-2 bg-black/80 text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded-full">Sold</div>
                ) : null}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button
                    onClick={(e) => onPlay(e, beat)}
                    className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {beat.genre} · {beat.bpm} BPM{beat.key ? ` · ${beat.key}` : ""}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-[#1DB954]">{priceLabel(beat)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
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
                      <Heart size={14} fill={liked.has(beat.id) ? "#1DB954" : "none"} className={liked.has(beat.id) ? "text-[#1DB954]" : ""} />
                    </button>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#282828] text-white group-hover:bg-[#1DB954] group-hover:text-black transition-colors">
                      View
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Music size={32} className="mx-auto mb-3 opacity-40" />
          <p>No beats match your filters.</p>
        </div>
      )}
    </div>
  );
}
