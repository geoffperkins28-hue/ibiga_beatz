"use client";

import { useRef, useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import Field from "@/components/Field";
import Honeypot from "@/components/Honeypot";
import { services } from "@/lib/constants";
import { submitBooking } from "@/lib/actions";

export default function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: services[0],
    date: "",
    notes: "",
  });
  const [hp, setHp] = useState("");
  const mountedAt = useRef(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitBooking(form, { hp, elapsedMs: Date.now() - mountedAt.current });
      if (res.ok) setSubmitted(true);
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 flex items-center justify-center mb-6">
          <Calendar size={36} className="text-[#1DB954]" />
        </div>
        <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Your session request has been sent. You&apos;ll receive a confirmation email within a few hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 px-8 py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Book a Session</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Schedule studio time, mixing, mastering or a one-on-one consultation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {services.map((s) => (
          <button
            key={s}
            onClick={() => update("service", s)}
            className={`p-4 rounded-2xl border text-sm font-medium text-left transition-all ${
              form.service === s
                ? "border-[#1DB954] bg-[#1DB954]/10 text-white"
                : "border-border bg-card text-muted-foreground hover:text-white hover:border-white/20"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <Honeypot value={hp} onChange={setHp} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} placeholder="Your name" />
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder="your@email.com" type="email" />
          <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+234 800 000 0000" />
          <Field label="Preferred Date" value={form.date} onChange={(v) => update("date", v)} placeholder="" type="date" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any specific requests or information..."
            rows={3}
            className="mt-1.5 w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pending}
          className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Request Booking"}
        </button>
      </div>
    </div>
  );
}
