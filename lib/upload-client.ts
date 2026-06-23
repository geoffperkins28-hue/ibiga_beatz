"use client";

import { getBrowserSupabase } from "./supabase/browser";
import { createSignedUpload } from "./actions";

const MEDIA_BUCKET = "media";

export interface UploadOptions {
  /** "image" enforces image types ≤5MB, "audio" enforces audio types ≤30MB */
  kind: "image" | "audio";
}

const LIMITS = {
  image: { bytes: 5 * 1024 * 1024, label: "5 MB", test: (t: string) => t.startsWith("image/") },
  audio: { bytes: 30 * 1024 * 1024, label: "30 MB", test: (t: string) => t.startsWith("audio/") },
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
  if (!limit.test(file.type)) {
    throw new Error(`Please choose a ${kind} file.`);
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
