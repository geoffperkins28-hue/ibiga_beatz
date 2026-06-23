"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import type { Beat } from "@/lib/types";

function fmt(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MiniPlayer({
  beat,
  onClose,
}: {
  beat: Beat;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAudio = Boolean(beat.audioUrl);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

  // Real audio playback when a URL is present.
  useEffect(() => {
    if (!hasAudio) return;
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, hasAudio]);

  // Simulated progress when there's no audio file (mock data).
  useEffect(() => {
    if (hasAudio || !playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPlaying(false);
          return 0;
        }
        return p + 0.5;
      });
    }, 150);
    return () => clearInterval(id);
  }, [playing, hasAudio]);

  // Reset when the beat changes.
  useEffect(() => {
    setPlaying(true);
    setProgress(0);
    setCurrent(0);
  }, [beat.id]);

  const displayTotal = hasAudio ? fmt(total) : beat.duration || "0:00";
  const displayCurrent = hasAudio
    ? fmt(current)
    : fmt((progress / 100) * 165);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-border">
      {hasAudio && (
        <audio
          ref={audioRef}
          src={beat.audioUrl ?? undefined}
          onLoadedMetadata={(e) => setTotal(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            setCurrent(el.currentTime);
            setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
        />
      )}

      {/* Mobile: thin progress line pinned to the top edge */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-[#535353]">
        <div className="h-full bg-[#1DB954]" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-3 md:gap-6 px-3 md:px-6 py-2.5 md:py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beat.image} alt={beat.title} className="w-11 h-11 md:w-14 md:h-14 rounded-lg object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{beat.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {beat.genre} · {beat.bpm} BPM
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 md:flex-1 md:max-w-xs">
          <div className="flex items-center gap-3 md:gap-4">
            <button className="hidden md:block text-muted-foreground hover:text-white transition-colors" aria-label="Previous">
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} fill="black" />}
            </button>
            <button className="hidden md:block text-muted-foreground hover:text-white transition-colors" aria-label="Next">
              <SkipForward size={16} />
            </button>
          </div>
          {/* Desktop: inline progress with timestamps */}
          <div className="hidden md:flex w-full items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8 text-right">{displayCurrent}</span>
            <div className="flex-1 h-1 bg-[#535353] rounded-full cursor-pointer group">
              <div
                className="h-full bg-[#1DB954] rounded-full group-hover:bg-accent transition-colors"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground w-8">{displayTotal}</span>
          </div>
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          <Volume2 size={16} className="text-muted-foreground" />
          <div className="w-20 h-1 bg-[#535353] rounded-full">
            <div className="h-full bg-white rounded-full w-3/4" />
          </div>
        </div>

        <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors shrink-0" aria-label="Close player">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
