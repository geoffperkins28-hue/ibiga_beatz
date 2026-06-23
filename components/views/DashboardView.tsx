"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Mic,
  Calendar,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Search,
  Settings,
  X,
  ExternalLink,
  Upload,
  Loader2,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import type {
  Beat,
  Song,
  DashStat,
  Client,
  CustomRequest,
  Booking,
  ProducerProfile,
} from "@/lib/types";
import { statusColors } from "@/lib/constants";
import { getEmbed } from "@/lib/embed";
import {
  createBeat,
  deleteBeat,
  createSong,
  deleteSong,
  type BeatInput,
  type SongInput,
} from "@/lib/actions";
import { uploadFile } from "@/lib/upload-client";

const statIcons: Record<string, React.ElementType> = {
  DollarSign,
  ShoppingBag,
  Mic,
  Calendar,
};

type Tab = "overview" | "beats" | "productions" | "requests" | "bookings" | "clients";
const tabs: Tab[] = ["overview", "beats", "productions", "requests", "bookings", "clients"];

const inputCls =
  "w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardView({
  profile,
  beats,
  songs,
  stats,
  clients,
  requests,
  bookings,
}: {
  profile: ProducerProfile;
  beats: Beat[];
  songs: Song[];
  stats: DashStat[];
  clients: Client[];
  requests: CustomRequest[];
  bookings: Booking[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showBeatModal, setShowBeatModal] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const removeBeat = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteBeat(id);
      if (res.ok) refresh();
      else setError(res.error ?? "Failed to delete.");
    });
  };

  const removeSong = (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from productions?`)) return;
    startTransition(async () => {
      const res = await deleteSong(id);
      if (res.ok) refresh();
      else setError(res.error ?? "Failed to delete.");
    });
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Sticky header + tabs so navigation stays put while content scrolls */}
      <div className="sticky top-0 z-20 bg-background -mx-6 px-6 -mt-6 pt-6 pb-3 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">Producer Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {profile.displayName.split(" ")[0]} 👋</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/admin/settings" className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#383838] transition-colors" aria-label="Settings">
              <Settings size={16} className="text-muted-foreground" />
            </Link>
            <button className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#383838] transition-colors" aria-label="Notifications">
              <Bell size={16} className="text-muted-foreground" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatarUrl} alt={profile.displayName} className="w-9 h-9 rounded-full object-cover" />
          </div>
        </div>

        {/* Tab Nav — scrolls horizontally on its own instead of the whole page */}
        <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
          <div className="flex gap-1 bg-[#282828] rounded-2xl p-1 w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  activeTab === tab ? "bg-[#1DB954] text-black" : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = statIcons[s.icon] ?? DollarSign;
              return (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
                      <Icon size={18} className="text-[#1DB954]" />
                    </div>
                    <span className="text-xs font-semibold text-[#1DB954]">{s.change}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">Recent Clients</h3>
              <div className="space-y-3">
                {clients.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.orders} orders · {c.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#1DB954] shrink-0">{c.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">Recent Requests</h3>
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.genre} · {r.bpm} BPM · {r.date}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${statusColors[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "beats" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">{beats.length} beats in store</p>
            <button
              onClick={() => setShowBeatModal(true)}
              className="px-4 py-2 rounded-full bg-[#1DB954] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[#1ed760] transition-colors"
            >
              <Plus size={14} /> Upload Beat
            </button>
          </div>
          <div className="space-y-2">
            {beats.map((beat) => (
              <div key={beat.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:bg-[#282828] transition-colors group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={beat.image} alt={beat.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm truncate">{beat.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{beat.genre} · {beat.bpm} BPM · {beat.mood}</p>
                </div>
                <span className="text-sm font-bold text-[#1DB954] shrink-0">${beat.price}</span>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{beat.plays.toLocaleString()} plays</span>
                <button
                  onClick={() => removeBeat(beat.id, beat.title)}
                  disabled={pending}
                  className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0 disabled:opacity-50"
                  aria-label="Delete beat"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
            {beats.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No beats yet — upload your first one.</p>}
          </div>
        </div>
      )}

      {activeTab === "productions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">{songs.length} produced songs · paste real streaming links</p>
            <button
              onClick={() => setShowSongModal(true)}
              className="px-4 py-2 rounded-full bg-[#1DB954] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[#1ed760] transition-colors"
            >
              <Plus size={14} /> Add Song
            </button>
          </div>
          <div className="space-y-2">
            {songs.map((song) => {
              const playable = Boolean(getEmbed(song.link));
              return (
                <div key={song.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={song.cover} alt={song.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist} · {song.year}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${playable ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {playable ? "playable" : "no link"}
                  </span>
                  <button
                    onClick={() => removeSong(song.id, song.title)}
                    disabled={pending}
                    className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0 disabled:opacity-50"
                    aria-label="Delete song"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              );
            })}
            {songs.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No productions yet — add a song with its Spotify link.</p>}
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.genre} · {r.bpm} BPM · Budget: {r.budget}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[r.status] ?? ""}`}>{r.status}</span>
                  <button className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#383838] transition-colors" aria-label="Edit">
                    <Edit2 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{b.name}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${statusColors[b.status] ?? ""}`}>{b.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{b.service} · {b.date}{b.time ? ` at ${b.time}` : ""}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex-1 md:flex-none px-3 py-1.5 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs font-semibold hover:bg-[#1DB954]/20 transition-colors">Accept</button>
                <button className="flex-1 md:flex-none px-3 py-1.5 rounded-full bg-[#282828] text-muted-foreground text-xs hover:text-white transition-colors">Reschedule</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "clients" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search clients..." className="w-full bg-[#282828] border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50" />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  {["Client", "Email", "Orders", "Total Spend", "Last Seen"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-[#282828] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-xs font-bold text-[#1DB954]">{c.name[0]}</div>
                        <span className="text-sm font-medium text-white whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-3 text-sm text-white">{c.orders}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#1DB954] whitespace-nowrap">{c.amount}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBeatModal && (
        <AddBeatModal
          onClose={() => setShowBeatModal(false)}
          onSaved={() => {
            setShowBeatModal(false);
            refresh();
          }}
        />
      )}
      {showSongModal && (
        <AddSongModal
          onClose={() => setShowSongModal(false)}
          onSaved={() => {
            setShowSongModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/** Pick a file from the device → uploads straight to Storage, returns its URL. */
function FileField({
  label,
  kind,
  folder,
  value,
  onUploaded,
}: {
  label: string;
  kind: "image" | "audio";
  folder: string;
  value: string;
  onUploaded: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");

  const pick = async (file: File) => {
    setErr(null);
    setName(file.name);
    setUploading(true);
    try {
      const url = await uploadFile(file, folder, { kind });
      onUploaded(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-center gap-3">
        {kind === "image" && value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="" className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[#282828] border border-border flex items-center justify-center shrink-0">
            {kind === "image" ? (
              <ImageIcon size={18} className="text-muted-foreground" />
            ) : (
              <Music size={18} className={value ? "text-[#1DB954]" : "text-muted-foreground"} />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-full border border-border text-sm text-white hover:border-white/30 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : value ? "Replace" : "Choose file"}
          </button>
          {value && !uploading && (
            <p className="text-[11px] text-[#1DB954] mt-1 truncate">{name || (kind === "audio" ? "Audio ready" : "Image ready")}</p>
          )}
          {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
        </div>
      </div>
      {kind === "audio" && value && <audio src={value} controls className="w-full mt-2" />}
      <input
        ref={ref}
        type="file"
        accept={kind === "image" ? "image/*" : "audio/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
        }}
      />
    </div>
  );
}

function AddBeatModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<BeatInput>({ title: "", genre: "Afrobeats", bpm: "", mood: "", price: "", duration: "", image: "", audioUrl: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const up = (k: keyof BeatInput, v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = () =>
    start(async () => {
      setErr(null);
      if (!f.audioUrl) {
        setErr("Upload the beat audio (MP3) before saving.");
        return;
      }
      const res = await createBeat(f);
      if (res.ok) onSaved();
      else setErr(res.error ?? "Failed to save.");
    });

  return (
    <Modal title="Upload Beat" onClose={onClose}>
      <div className="space-y-4">
        <input className={inputCls} placeholder="Title" value={f.title} onChange={(e) => up("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Genre" value={f.genre} onChange={(e) => up("genre", e.target.value)} />
          <input className={inputCls} placeholder="BPM" value={f.bpm} onChange={(e) => up("bpm", e.target.value)} />
          <input className={inputCls} placeholder="Mood" value={f.mood} onChange={(e) => up("mood", e.target.value)} />
          <input className={inputCls} placeholder="Price (USD)" value={f.price} onChange={(e) => up("price", e.target.value)} />
        </div>
        <input className={inputCls} placeholder="Duration (e.g. 2:45)" value={f.duration} onChange={(e) => up("duration", e.target.value)} />
        <FileField label="Cover art" kind="image" folder="beats/covers" value={f.image} onUploaded={(url) => up("image", url)} />
        <FileField label="Beat audio (MP3)" kind="audio" folder="beats/audio" value={f.audioUrl} onUploaded={(url) => up("audioUrl", url)} />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button onClick={save} disabled={pending} className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60">
          {pending ? "Saving…" : "Save Beat"}
        </button>
      </div>
    </Modal>
  );
}

function AddSongModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<SongInput>({ title: "", artist: "", cover: "", platform: "spotify", link: "", year: String(new Date().getFullYear()) });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const up = (k: keyof SongInput, v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = () =>
    start(async () => {
      setErr(null);
      const res = await createSong(f);
      if (res.ok) onSaved();
      else setErr(res.error ?? "Failed to save.");
    });

  return (
    <Modal title="Add Produced Song" onClose={onClose}>
      <div className="space-y-3">
        <input className={inputCls} placeholder="Song title" value={f.title} onChange={(e) => up("title", e.target.value)} />
        <input className={inputCls} placeholder="Artist" value={f.artist} onChange={(e) => up("artist", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select className={inputCls} value={f.platform} onChange={(e) => up("platform", e.target.value)}>
            <option value="spotify">Spotify</option>
            <option value="youtube">YouTube</option>
            <option value="apple">Apple Music</option>
          </select>
          <input className={inputCls} placeholder="Year" value={f.year} onChange={(e) => up("year", e.target.value)} />
        </div>
        <input className={inputCls} placeholder="Streaming link (e.g. https://open.spotify.com/track/…)" value={f.link} onChange={(e) => up("link", e.target.value)} />
        <input className={inputCls} placeholder="Cover image URL" value={f.cover} onChange={(e) => up("cover", e.target.value)} />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ExternalLink size={12} /> Paste a real Spotify/YouTube/Apple link so it plays inline.
        </p>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button onClick={save} disabled={pending} className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60">
          {pending ? "Saving…" : "Save Song"}
        </button>
      </div>
    </Modal>
  );
}
