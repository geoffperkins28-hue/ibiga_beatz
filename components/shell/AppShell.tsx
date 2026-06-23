"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  User,
  Music,
  Mic,
  Calendar,
  Search,
  Bell,
  Headphones,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type NavItem = { href: string; icon: React.ElementType; label: string };

const menuItems: NavItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/store", icon: ShoppingBag, label: "Beat Store" },
  { href: "/portfolio", icon: User, label: "Portfolio" },
  { href: "/songs", icon: Music, label: "Productions" },
  { href: "/request", icon: Mic, label: "Custom Request" },
  { href: "/booking", icon: Calendar, label: "Book Session" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The login page renders itself full-screen — no chrome.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Admin area: its own minimal chrome, no public sidebar (hidden from users).
  if (pathname.startsWith("/admin")) {
    const logout = async () => {
      await getBrowserSupabase()?.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    };
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <header className="h-14 bg-black border-b border-border/30 flex items-center px-4 md:px-6 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
              <Headphones size={15} className="text-black" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">Ibiga Beatz Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full bg-[#282828] text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ExternalLink size={13} /> View Site
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-[#282828] text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    );
  }

  // Public site shell
  const navClass = (href: string) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(pathname, href)
        ? "bg-[#282828] text-white"
        : "text-muted-foreground hover:text-white hover:bg-[#282828]/60"
    }`;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-black flex flex-col shrink-0 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border/30">
          <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
              <Headphones size={18} className="text-black" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Ibiga Beatz</p>
              <p className="text-[10px] text-muted-foreground">Music Producer</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pb-2">
            Menu
          </p>
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={navClass(href)} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} className={isActive(pathname, href) ? "text-[#1DB954]" : ""} />
              {label}
              {isActive(pathname, href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1DB954]" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#121212]/80 backdrop-blur border-b border-border/30 flex items-center px-6 gap-4 shrink-0">
          <button
            className="md:hidden w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} className="text-muted-foreground" />
          </button>
          <div className="relative flex-1 max-w-sm hidden md:block">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search beats, artists..."
              className="w-full bg-[#282828] border border-border rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/store"
              className="px-4 py-2 rounded-full bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed760] transition-colors hidden md:block"
            >
              Buy Beats
            </Link>
            <button className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#383838] transition-colors" aria-label="Notifications">
              <Bell size={16} className="text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
