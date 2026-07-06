"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, X, ChevronDown, ListMusic, Music } from "lucide-react";
import { usePlayer } from "@/lib/player";

function fmt(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Player() {
  const { current, queue, index, playing, expanded, toggle, setPlaying, next, prev, playIndex, setExpanded, close } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current_, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const hasAudio = Boolean(current?.audioUrl);

  // Sync play/pause with the audio element.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !hasAudio) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, hasAudio, index, setPlaying]);

  // Reset timers when the track changes.
  useEffect(() => {
    setCurrent(0);
    setTotal(0);
  }, [current?.id]);

  if (!current) return null;

  const progress = total ? (current_ / total) * 100 : 0;

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !total) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * total;
  };

  return (
    <>
      {hasAudio && (
        <audio
          ref={audioRef}
          src={current.audioUrl ?? undefined}
          autoPlay={playing}
          onLoadedMetadata={(e) => setTotal(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onEnded={() => next()}
        />
      )}

      {/* ── Mini bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-border">
        {/* thin progress line on top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#535353]">
          <div className="h-full bg-[#1DB954]" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3 px-3 md:px-6 py-2.5">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3 min-w-0 flex-1 text-left"
            aria-label="Open player"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.image} alt={current.title} className="w-11 h-11 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{current.title}</p>
              <p className="text-xs text-muted-foreground truncate">{current.genre} · {current.bpm} BPM</p>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {queue.length > 1 && (
              <button onClick={prev} className="hidden sm:block text-muted-foreground hover:text-white transition-colors" aria-label="Previous">
                <SkipBack size={18} />
              </button>
            )}
            <button
              onClick={toggle}
              disabled={!hasAudio}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0 disabled:opacity-40 disabled:hover:scale-100"
              aria-label={playing ? "Pause" : "Play"}
              title={hasAudio ? undefined : "No preview uploaded for this beat"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} fill="black" />}
            </button>
            {queue.length > 1 && (
              <button onClick={next} className="text-muted-foreground hover:text-white transition-colors" aria-label="Next">
                <SkipForward size={18} />
              </button>
            )}
            <button onClick={close} className="text-muted-foreground hover:text-white transition-colors" aria-label="Close player">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Full-screen player ───────────────────────────────────── */}
      {expanded && (
        <div className="fixed inset-0 z-[60] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex flex-col safe-top">
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <button onClick={() => setExpanded(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Minimize">
              <ChevronDown size={20} className="text-white" />
            </button>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Now Playing</p>
            <button onClick={close} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Close player">
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8">
            <div className="max-w-md mx-auto flex flex-col">
              {/* Cover */}
              <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
              </div>

              {/* Title */}
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white truncate">{current.title}</h2>
                <p className="text-muted-foreground mt-1">{current.genre} · {current.bpm} BPM{current.mood ? ` · ${current.mood}` : ""}</p>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="h-1.5 bg-white/15 rounded-full cursor-pointer group" onClick={seek}>
                  <div className="h-full bg-[#1DB954] rounded-full relative" style={{ width: `${progress}%` }}>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{fmt(current_)}</span>
                  <span className="text-xs text-muted-foreground">{hasAudio ? fmt(total) : current.duration || "0:00"}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <button onClick={prev} disabled={queue.length < 2} className="text-white/80 hover:text-white transition-colors disabled:opacity-30" aria-label="Previous">
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button
                  onClick={toggle}
                  disabled={!hasAudio}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause size={26} /> : <Play size={26} fill="black" className="ml-0.5" />}
                </button>
                <button onClick={next} disabled={queue.length < 2} className="text-white/80 hover:text-white transition-colors disabled:opacity-30" aria-label="Next">
                  <SkipForward size={28} fill="currentColor" />
                </button>
              </div>

              {!hasAudio && (
                <p className="text-center text-xs text-yellow-400/80 mt-4">No preview uploaded for this beat yet.</p>
              )}

              {/* Queue */}
              {queue.length > 1 && (
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ListMusic size={16} className="text-muted-foreground" />
                    <p className="text-sm font-semibold text-white">Up Next</p>
                  </div>
                  <div className="space-y-1">
                    {queue.map((b, i) => (
                      <button
                        key={b.id}
                        onClick={() => playIndex(i)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${i === index ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image} alt={b.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${i === index ? "text-[#1DB954] font-semibold" : "text-white"}`}>{b.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{b.genre} · {b.bpm} BPM</p>
                        </div>
                        {i === index && playing ? (
                          <Pause size={14} className="text-[#1DB954] shrink-0" />
                        ) : (
                          <Music size={14} className="text-muted-foreground shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
