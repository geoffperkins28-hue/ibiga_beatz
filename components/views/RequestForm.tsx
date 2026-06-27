"use client";

import { useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";
import Field from "@/components/Field";
import VoiceCapture from "@/components/VoiceCapture";
import Honeypot from "@/components/Honeypot";
import { requestGenres } from "@/lib/constants";
import { submitCustomRequest } from "@/lib/actions";

const empty = {
  name: "",
  email: "",
  phone: "",
  genre: "Afrobeats",
  bpm: "",
  mood: "",
  refArtist: "",
  deadline: "",
  budget: "",
  notes: "",
  voiceUrl: "",
};

export default function RequestForm() {
  const [form, setForm] = useState(empty);
  const [hp, setHp] = useState("");
  const mountedAt = useRef(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitCustomRequest(form, { hp, elapsedMs: Date.now() - mountedAt.current });
      if (res.ok) setSubmitted(true);
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 flex items-center justify-center mb-6">
          <Check size={36} className="text-[#1DB954]" />
        </div>
        <h2 className="text-2xl font-bold text-white">Request Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Your custom beat request has been received. Ibiga will review and respond within 24–48 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm(empty);
          }}
          className="mt-8 px-8 py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Custom Beat Request</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tell Ibiga exactly what you need — he&apos;ll craft it just for you
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
        <Honeypot value={hp} onChange={setHp} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Your Name" value={form.name} onChange={(v) => update("name", v)} placeholder="Tunde Bakare" />
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder="tunde@example.com" type="email" />
          <Field label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+234 800 000 0000" />
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              className="mt-1.5 w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40"
            >
              {requestGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <Field label="Desired BPM" value={form.bpm} onChange={(v) => update("bpm", v)} placeholder="e.g. 100" />
          <Field label="Mood / Vibe" value={form.mood} onChange={(v) => update("mood", v)} placeholder="e.g. Dark, Euphoric, Chill" />
          <Field label="Reference Artist" value={form.refArtist} onChange={(v) => update("refArtist", v)} placeholder="e.g. Burna Boy" />
          <Field label="Deadline" value={form.deadline} onChange={(v) => update("deadline", v)} placeholder="" type="date" />
          <Field label="Budget (USD)" value={form.budget} onChange={(v) => update("budget", v)} placeholder="e.g. $150" />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Describe your vision, lyrics concept, or any specific sounds you want..."
            rows={4}
            className="mt-1.5 w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40 resize-none"
          />
        </div>

        <VoiceCapture value={form.voiceUrl} onChange={(url) => update("voiceUrl", url)} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pending}
          className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
