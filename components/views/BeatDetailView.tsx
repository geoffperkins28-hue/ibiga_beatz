"use client";

import Link from "next/link";
import { ArrowLeft, Play, Pause, Check, ShieldCheck, Lock } from "lucide-react";
import type { Beat } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import BeatCard from "@/components/BeatCard";

const EXCLUSIVE_INCLUDES = [
  "Exclusive rights — sold once, then removed from the store",
  "Full MP3 + WAV master delivered instantly",
  "Unlimited commercial use & distribution",
  "Producer credit: “Prod. Ibiga Beatz”",
];

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl px-4 py-3 text-center">
      <p className="text-sm font-bold text-white truncate">{value || "—"}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function BeatDetailView({ beat, related }: { beat: Beat; related: Beat[] }) {
  const { current, playing, play, toggle } = usePlayer();
  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;
  const hasAudio = Boolean(beat.audioUrl);

  const onPlay = () => {
    if (isCurrent) toggle();
    else play(beat, [beat, ...related]);
  };

  return (
    <div className="space-y-8">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to store
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Artwork + play */}
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-border group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beat.image} alt={beat.title} className={`w-full h-full object-cover ${beat.sold ? "opacity-60" : ""}`} />
          {beat.sold && (
            <div className="absolute top-3 right-3 bg-black/80 text-xs text-red-400 font-semibold px-3 py-1 rounded-full">Sold</div>
          )}
          <button
            onClick={onPlay}
            disabled={!hasAudio}
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"} disabled:cursor-not-allowed`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
              {isPlaying ? <Pause size={26} fill="black" /> : <Play size={26} fill="black" className="ml-1" />}
            </span>
          </button>
          {!hasAudio && (
            <span className="absolute bottom-3 left-3 text-[11px] text-yellow-400/90 bg-black/70 px-2 py-1 rounded-full">No preview yet</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest">{beat.genre}</p>
          <h1 className="text-3xl font-bold text-white mt-1">{beat.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">Prod. Ibiga Beatz</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            <MetaTile label="BPM" value={beat.bpm ? String(beat.bpm) : ""} />
            <MetaTile label="Key" value={beat.key ?? ""} />
            <MetaTile label="Mood" value={beat.mood} />
            <MetaTile label="Length" value={beat.duration} />
          </div>

          {/* Price + license */}
          <div className="mt-6 bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{formatNaira(beat.price)}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} className="text-[#1DB954]" /> Exclusive license
                </p>
              </div>
              <button
                onClick={onPlay}
                disabled={!hasAudio}
                className="px-5 py-2.5 rounded-full bg-[#282828] text-white text-sm font-semibold hover:bg-[#383838] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                {isPlaying ? "Pause" : "Preview"}
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {EXCLUSIVE_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check size={15} className="text-[#1DB954] mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="mt-5 w-full py-3 rounded-full bg-[#1DB954]/60 text-black font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              title="Secure checkout is coming soon"
            >
              <Lock size={15} /> {beat.sold ? "Sold" : "Buy — checkout coming soon"}
            </button>
            {!beat.sold && (
              <p className="text-center text-[11px] text-muted-foreground mt-2">
                Want it now?{" "}
                <Link href="/request" className="text-[#1DB954] hover:underline">Message the producer</Link>.
              </p>
            )}
          </div>

          {/* Producer notes */}
          {beat.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white mb-2">Producer notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{beat.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">More {beat.genre} beats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((b) => (
              <BeatCard key={b.id} beat={b} queue={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
