"use client";

import Link from "next/link";
import { Play, Pause } from "lucide-react";
import type { Beat } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { usePlayer } from "@/lib/player";

export default function BeatCard({ beat, queue }: { beat: Beat; queue?: Beat[] }) {
  const { current, playing, play, toggle } = usePlayer();
  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;

  const onPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) toggle();
    else play(beat, queue);
  };

  return (
    <Link
      href={`/store/${beat.id}`}
      className="block bg-card rounded-2xl overflow-hidden border border-border hover:bg-[#282828] transition-all duration-200 group"
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beat.image} alt={beat.title} className={`w-full h-full object-cover ${beat.sold ? "opacity-60" : ""}`} />
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onClick={onPlay}
            className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          </button>
        </div>
        {beat.isFree ? (
          <div className="absolute top-2 right-2 bg-[#1DB954] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            Free
          </div>
        ) : beat.sold ? (
          <div className="absolute top-2 right-2 bg-black/80 text-xs text-red-400 font-semibold px-2 py-0.5 rounded-full">
            Sold
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {beat.genre} · {beat.bpm} BPM
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[#1DB954]">{priceLabel(beat)}</span>
          <span className="text-[10px] text-muted-foreground">{beat.plays.toLocaleString()} plays</span>
        </div>
      </div>
    </Link>
  );
}
