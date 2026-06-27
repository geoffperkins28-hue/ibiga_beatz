import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ibiga-beatz.vercel.app";
const description =
  "Buy exclusive beats, request custom productions, and book studio sessions with Ibiga Beatz — Afrobeats, Amapiano & R&B producer.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ibiga Beatz — Music Producer",
    template: "%s · Ibiga Beatz",
  },
  description,
  applicationName: "Ibiga Beatz",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ibiga Beatz",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Ibiga Beatz",
    title: "Ibiga Beatz — Music Producer",
    description,
    url: siteUrl,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ibiga Beatz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ibiga Beatz — Music Producer",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
