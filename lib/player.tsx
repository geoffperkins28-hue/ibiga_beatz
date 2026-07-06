"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Beat } from "./types";

interface PlayerState {
  queue: Beat[];
  index: number;
  current: Beat | null;
  playing: boolean;
  expanded: boolean;
  /** Play a beat. Optionally give it a queue (e.g. the current store list). */
  play: (beat: Beat, queue?: Beat[]) => void;
  toggle: () => void;
  setPlaying: (v: boolean) => void;
  next: () => void;
  prev: () => void;
  playIndex: (i: number) => void;
  setExpanded: (v: boolean) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Beat[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const play = useCallback((beat: Beat, list?: Beat[]) => {
    const q = list && list.length ? list : [beat];
    const i = Math.max(0, q.findIndex((b) => b.id === beat.id));
    setQueue(q);
    setIndex(i);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const next = useCallback(() => {
    setIndex((i) => (queue.length ? (i + 1) % queue.length : 0));
    setPlaying(true);
  }, [queue.length]);

  const prev = useCallback(() => {
    setIndex((i) => (queue.length ? (i - 1 + queue.length) % queue.length : 0));
    setPlaying(true);
  }, [queue.length]);

  const playIndex = useCallback((i: number) => {
    setIndex(i);
    setPlaying(true);
  }, []);

  const close = useCallback(() => {
    setPlaying(false);
    setExpanded(false);
    setQueue([]);
    setIndex(0);
  }, []);

  const current = queue[index] ?? null;

  const value = useMemo<PlayerState>(
    () => ({ queue, index, current, playing, expanded, play, toggle, setPlaying, next, prev, playIndex, setExpanded, close }),
    [queue, index, current, playing, expanded, play, toggle, next, prev, playIndex, close]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
