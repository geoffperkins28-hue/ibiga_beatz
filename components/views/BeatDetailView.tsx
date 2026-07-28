"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Check, ShieldCheck, ShoppingCart, CheckCircle2 } from "lucide-react";
import type { Beat } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { submitOrder } from "@/lib/actions";
import Honeypot from "@/components/Honeypot";
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

            <div className="mt-5">
              <OrderPanel beat={beat} />
            </div>
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

function OrderPanel({ beat }: { beat: Beat }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [hp, setHp] = useState("");
  const mountedAt = useRef(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const up = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const inputCls =
    "w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40";

  const submit = () =>
    start(async () => {
      setError(null);
      if (!form.email.trim() || !form.email.includes("@")) {
        setError("Enter a valid email so we can send your beat.");
        return;
      }
      const res = await submitOrder(
        {
          beatId: beat.id,
          beatTitle: beat.title,
          amount: beat.price,
          name: form.name,
          email: form.email,
          phone: form.phone,
          note: form.note,
        },
        { hp, elapsedMs: Date.now() - mountedAt.current }
      );
      if (res.ok) setDone(true);
      else setError(res.error ?? "Something went wrong. Please try again.");
    });

  if (beat.sold) {
    return (
      <button disabled className="w-full py-3 rounded-full bg-[#282828] text-muted-foreground font-semibold cursor-not-allowed">
        Sold — no longer available
      </button>
    );
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 size={32} className="text-[#1DB954] mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">Order received!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ibiga will confirm payment and email your files to <span className="text-white">{form.email}</span>.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold flex items-center justify-center gap-2 hover:bg-[#1ed760] transition-colors"
      >
        <ShoppingCart size={16} /> Buy — {formatNaira(beat.price)}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <Honeypot value={hp} onChange={setHp} />
      <input className={inputCls} placeholder="Your name" value={form.name} onChange={(e) => up("name", e.target.value)} />
      <input className={inputCls} placeholder="Email (where we send the beat)" type="email" value={form.email} onChange={(e) => up("email", e.target.value)} />
      <input className={inputCls} placeholder="Phone (optional)" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
      <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Anything you'd like the producer to know? (optional)" value={form.note} onChange={(e) => up("note", e.target.value)} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={pending}
        className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60"
      >
        {pending ? "Placing order…" : `Place order — ${formatNaira(beat.price)}`}
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        Payment is arranged with the producer. Secure card checkout is coming soon.
      </p>
    </div>
  );
}
