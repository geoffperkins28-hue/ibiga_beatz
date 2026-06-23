import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage public buckets — replace <project-ref> after setup,
      // or leave the wildcard so any *.supabase.co public URL renders.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
