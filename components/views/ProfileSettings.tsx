"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Check, Loader2 } from "lucide-react";
import type { ProducerProfile } from "@/lib/types";
import { updateProfile, uploadImage } from "@/lib/actions";

const inputCls =
  "mt-1.5 w-full bg-[#282828] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40";
const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

function ImagePicker({
  label,
  value,
  folder,
  rounded,
  onChange,
}: {
  label: string;
  value: string;
  folder: string;
  rounded?: boolean;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = async (file: File) => {
    setErr(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.url) onChange(res.url);
    else setErr(res.error ?? "Upload failed.");
  };

  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="mt-2 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt={label}
          className={`object-cover border border-border ${rounded ? "w-20 h-20 rounded-full" : "w-32 h-20 rounded-xl"}`}
        />
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-full border border-border text-sm text-white hover:border-white/30 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pick(file);
          }}
        />
      </div>
    </div>
  );
}

export default function ProfileSettings({ profile }: { profile: ProducerProfile }) {
  const router = useRouter();
  const [form, setForm] = useState<ProducerProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const up = (k: keyof ProducerProfile, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const save = () =>
    start(async () => {
      setErr(null);
      setSaved(false);
      const res = await updateProfile(form);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setErr(res.error ?? "Failed to save.");
      }
    });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#383838] transition-colors" aria-label="Back">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Update your photos, name and bio — changes show on the public site.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
        <ImagePicker label="Hero image (homepage)" value={form.heroImageUrl} folder="hero" onChange={(url) => up("heroImageUrl", url)} />
        <ImagePicker label="Profile photo" value={form.avatarUrl} folder="avatar" rounded onChange={(url) => up("avatarUrl", url)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Display Name</label>
            <input className={inputCls} value={form.displayName} onChange={(e) => up("displayName", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} value={form.fullName} onChange={(e) => up("fullName", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Role / Title</label>
          <input className={inputCls} value={form.role} onChange={(e) => up("role", e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Tagline (homepage hero)</label>
          <textarea className={inputCls} rows={2} value={form.tagline} onChange={(e) => up("tagline", e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Bio (portfolio)</label>
          <textarea className={inputCls} rows={5} value={form.bio} onChange={(e) => up("bio", e.target.value)} />
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}
        {saved && (
          <p className="text-sm text-[#1DB954] flex items-center gap-1">
            <Check size={14} /> Saved.
          </p>
        )}

        <button onClick={save} disabled={pending} className="w-full py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-60">
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
