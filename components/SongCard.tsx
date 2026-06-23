import type { Song } from "@/lib/types";
import { platformColors } from "@/lib/constants";

export default function SongCard({ song }: { song: Song }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex items-center gap-4 p-4 hover:bg-[#282828] transition-colors cursor-pointer group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={song.cover} alt={song.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white text-sm truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        <p className="text-xs text-muted-foreground">{song.year}</p>
      </div>
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: platformColors[song.platform] }}
      />
    </div>
  );
}
