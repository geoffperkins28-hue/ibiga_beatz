"use client";

import { getBrowserSupabase } from "./supabase/browser";
import { createSignedUpload, createVoiceUpload, createDeliverableUpload } from "./actions";

const MEDIA_BUCKET = "media";
const DELIVERABLES_BUCKET = "deliverables";

export interface UploadOptions {
  /** "image" ≤5MB; "mp3" beat audio only ≤30MB */
  kind: "image" | "mp3";
}

const MP3_MIME = new Set(["audio/mpeg", "audio/mp3"]);

function isMp3File(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "mp3") return false;
  if (!file.type) return true;
  return MP3_MIME.has(file.type);
}

const LIMITS = {
  image: {
    bytes: 5 * 1024 * 1024,
    label: "5 MB",
    test: (file: File) => file.type.startsWith("image/"),
    typeError: "Please choose an image file.",
  },
  mp3: {
    bytes: 30 * 1024 * 1024,
    label: "30 MB",
    test: isMp3File,
    typeError: "Please choose an MP3 file.",
  },
};

/**
 * Uploads a file straight from the browser to Supabase Storage via a signed
 * upload URL (bypasses the Vercel Server Action body limit). Returns the public
 * URL. Throws on validation/upload errors with a user-friendly message.
 */
export async function uploadFile(
  file: File,
  folder: string,
  { kind }: UploadOptions
): Promise<string> {
  const limit = LIMITS[kind];
  if (!limit.test(file)) {
    throw new Error(limit.typeError);
  }
  if (file.size > limit.bytes) {
    throw new Error(`File is too large (max ${limit.label}).`);
  }

  const signed = await createSignedUpload(folder, file.name);
  if (signed.error || !signed.path || !signed.token || !signed.publicUrl) {
    throw new Error(signed.error ?? "Could not start the upload.");
  }

  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Storage isn't available.");

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: file.type,
    });
  if (error) throw new Error(error.message);

  return signed.publicUrl;
}

/**
 * Uploads a purchasable deliverable (full MP3/WAV/stems) to the PRIVATE
 * `deliverables` bucket. Returns the storage PATH (not a URL) to save on the
 * beat — buyers only ever receive short-lived signed URLs at fulfilment time.
 */
export async function uploadDeliverable(file: File): Promise<string> {
  const okType =
    file.type.startsWith("audio/") ||
    /\.(mp3|wav|aiff?|zip)$/i.test(file.name);
  if (!okType) throw new Error("Choose an audio file (MP3/WAV) or a .zip of stems.");
  if (file.size > 50 * 1024 * 1024) throw new Error("File is too large (max 50 MB).");

  const signed = await createDeliverableUpload(file.name);
  if (signed.error || !signed.path || !signed.token) {
    throw new Error(signed.error ?? "Could not start the upload.");
  }

  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Storage isn't available.");

  const { error } = await supabase.storage
    .from(DELIVERABLES_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw new Error(error.message);

  return signed.path;
}

/**
 * Public voice-idea upload for the (unauthenticated) custom-request form.
 * Accepts any audio file/recording ≤15 MB; uses the no-auth signed-URL action.
 */
export async function uploadPublicVoice(file: File): Promise<string> {
  if (!file.type.startsWith("audio/")) throw new Error("Please choose an audio file.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Recording is too large (max 15 MB).");

  const signed = await createVoiceUpload(file.name || "voice.webm");
  if (signed.error || !signed.path || !signed.token || !signed.publicUrl) {
    throw new Error(signed.error ?? "Could not start the upload.");
  }

  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Storage isn't available.");

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  return signed.publicUrl;
}
