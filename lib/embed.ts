import type { Platform } from "./types";

export interface Embed {
  type: Platform;
  src: string;
  height: number;
}

const SPOTIFY_TYPES = ["track", "album", "playlist", "artist", "episode", "show"];

/**
 * Converts a public Spotify / YouTube / Apple Music share URL into an
 * embeddable iframe source so visitors can play it inside the app.
 * Returns null if the URL can't be turned into an embed.
 */
export function getEmbed(url: string | undefined | null): Embed | null {
  if (!url || url === "#") return null;

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");

  // Spotify — https://open.spotify.com/track/<id> (may include /intl-xx/)
  if (host.endsWith("spotify.com")) {
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => SPOTIFY_TYPES.includes(p));
    if (idx >= 0 && parts[idx + 1]) {
      return {
        type: "spotify",
        src: `https://open.spotify.com/embed/${parts[idx]}/${parts[idx + 1]}`,
        height: 152,
      };
    }
  }

  // YouTube — watch?v=<id>, youtu.be/<id>, /embed/<id>
  if (host.endsWith("youtube.com") || host === "youtu.be") {
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else id = u.searchParams.get("v") || u.pathname.split("/embed/")[1] || "";
    if (id) {
      return { type: "youtube", src: `https://www.youtube.com/embed/${id}`, height: 200 };
    }
  }

  // Apple Music — swap host for the embed host
  if (host.endsWith("music.apple.com")) {
    return {
      type: "apple",
      src: url.replace(/music\.apple\.com/, "embed.music.apple.com"),
      height: 175,
    };
  }

  return null;
}
