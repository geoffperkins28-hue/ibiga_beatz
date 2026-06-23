"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import type { Song } from "@/lib/types";
import { platformColors } from "@/lib/constants";
import { getEmbed } from "@/lib/embed";

const platformLabel: Record<string, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  apple: "Apple Music",
};

export default function SongsView({ songs }: { songs: Song[] }) {
  const [selected, setSelected] = useState<Song | null>(null);
  const embed = selected ? getEmbed(selected.link) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Produced Songs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Songs I&apos;ve produced or co-produced — stream them right here
        </p>
      </div>

      {selected && (
        <div className="bg-gradient-to-br from-[#1a2a1a] to-card border border-[#1DB954]/20 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.cover} alt={selected.title} className="w-36 h-36 rounded-2xl object-cover shrink-0" />
            <div className="flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest mb-1">
                  {embed ? "Now Playing" : "Now Previewing"}
                </p>
                <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                <p className="text-muted-foreground">
                  {selected.artist} · {selected.year}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-[#282828] text-white hover:bg-[#383838] transition-colors"
                >
                  Close
                </button>
                {embed && selected.link !== "#" && (
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                  >
                    Open on {platformLabel[selected.platform]}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Inline player — plays directly in the app when a real link exists */}
          {embed ? (
            <div>
              <iframe
                key={embed.src}
                src={embed.src}
                width="100%"
                height={embed.height}
                style={{ borderRadius: 12 }}
                frameBorder={0}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title={selected.title}
              />
              {embed.type === "spotify" && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  30-sec preview · sign in to Spotify in the player for the full track.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add a real Spotify, YouTube or Apple Music link for this track to play it inline.
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {songs.map((song, i) => (
          <div
            key={song.id}
            className={`flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:bg-[#282828] transition-colors cursor-pointer group ${
              selected?.id === song.id ? "border-[#1DB954]/40" : ""
            }`}
            onClick={() => setSelected(song)}
          >
            <span className="text-muted-foreground text-sm w-5 text-right group-hover:hidden">{i + 1}</span>
            <Play size={14} className="text-[#1DB954] hidden group-hover:block shrink-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={song.cover} alt={song.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground">{song.artist}</p>
            </div>
            <span className="text-xs text-muted-foreground">{song.year}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[song.platform] }} />
              <span className="text-xs text-muted-foreground capitalize">{song.platform}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
