"use client";

import { useRef, useState } from "react";
import { Mic, Square, Upload, Loader2, Trash2, Loader } from "lucide-react";
import { uploadPublicVoice } from "@/lib/upload-client";

/**
 * Lets a visitor attach a voice idea — either upload an audio file or record
 * one in the browser (MediaRecorder). Uploads to Storage and reports the URL.
 */
export default function VoiceCapture({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const doUpload = async (file: File) => {
    setErr(null);
    setUploading(true);
    try {
      const url = await uploadPublicVoice(file);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const ext = (mr.mimeType || "audio/webm").includes("ogg") ? "ogg" : "webm";
        doUpload(new File([blob], `voice-idea.${ext}`, { type: blob.type }));
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setErr("Couldn't access the microphone. Check permissions or upload a file instead.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  if (value && !uploading) {
    return (
      <div className="border border-border rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voice idea attached</p>
        <audio src={value} controls className="w-full" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
        >
          <Trash2 size={12} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-[#1DB954]/10 flex items-center justify-center mx-auto mb-3">
        {uploading ? <Loader size={20} className="text-[#1DB954] animate-spin" /> : <Mic size={20} className="text-[#1DB954]" />}
      </div>
      <p className="text-sm font-semibold text-white">Voice Idea (optional)</p>
      <p className="text-xs text-muted-foreground mt-1">Hum or sing your melody — record here or upload (MP3/WAV/M4A, up to 15 MB)</p>

      <div className="flex items-center justify-center gap-3 mt-4">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="px-5 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2 animate-pulse"
          >
            <Square size={14} fill="currentColor" /> Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={uploading}
            className="px-5 py-2 rounded-full bg-[#1DB954] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[#1ed760] transition-colors disabled:opacity-60"
          >
            <Mic size={14} /> Record
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || recording}
          className="px-5 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {err && <p className="text-xs text-red-400 mt-3">{err}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) doUpload(file);
        }}
      />
    </div>
  );
}
