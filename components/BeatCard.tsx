"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import type { Beat } from "@/lib/types";

export default function BeatCard({ beat }: { beat: Beat }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden border border-border hover:bg-[#282828] transition-all duration-200 group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beat.image} alt={beat.title} className="w-full h-full object-cover" />
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying((p) => !p);
            }}
            className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          </button>
        </div>
        {beat.sold && (
          <div className="absolute top-2 right-2 bg-black/80 text-xs text-red-400 font-semibold px-2 py-0.5 rounded-full">
            Sold
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {beat.genre} · {beat.bpm} BPM
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[#1DB954]">${beat.price}</span>
          <span className="text-[10px] text-muted-foreground">{beat.plays.toLocaleString()} plays</span>
        </div>
      </div>
    </div>
  );
}
