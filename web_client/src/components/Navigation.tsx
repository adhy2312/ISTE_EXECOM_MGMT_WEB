"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy, Layers, Home, Zap, Crown, Telescope,
  BarChart2, User, Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/models";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const NAVLESS_ROUTES = ["/login", "/bootstrap"];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  if (!user || NAVLESS_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";
  const isAdmin = user.role === UserRole.chapterAdmin || user.email === ROOT_ADMIN;
  const isFaculty = user.role === UserRole.facultyAdvisor;

  // ── Role-based dock items (max 6) ────────────────────────────────────
  let links: { href: string; label: string; icon: React.ElementType }[];

  if (isFaculty) {
    links = [
      { href: "/",        label: "Home",    icon: Home },
      { href: "/faculty", label: "Observe", icon: Telescope },
    ];
  } else if (isAdmin) {
    links = [
      { href: "/",            label: "Home",     icon: Home },
      { href: "/leaderboard", label: "Ranks",    icon: Trophy },
      { href: "/hub",         label: "Hub",      icon: Layers },
      { href: "/evaluation",  label: "Eval",     icon: BarChart2 },
      { href: "/executive",   label: "Command",  icon: Crown },
      { href: "/settings",    label: "Settings", icon: Settings },
    ];
  } else {
    // General members, execomCore, secretary, treasurer, techHead, prMedia
    links = [
      { href: "/",            label: "Home",    icon: Home },
      { href: "/leaderboard", label: "Ranks",   icon: Trophy },
      { href: "/hub",         label: "Hub",     icon: Layers },
      { href: "/evaluation",  label: "Eval",    icon: BarChart2 },
      { href: "/points",      label: "My XP",   icon: Zap },
      { href: "/profile",     label: "Profile", icon: User },
    ];
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 0, right: 0, zIndex: 50,
      display: "flex", justifyContent: "center", pointerEvents: "none",
      paddingBottom: "var(--safe-area-inset-bottom)",
    }}>
      <nav ref={navRef} className="glass-panel dock-nav" style={{
        display: "flex", alignItems: "center", padding: "7px 10px", gap: 4,
        borderRadius: 40, pointerEvents: "auto", border: "1.5px solid var(--border-strong)",
      }}>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`dock-item ${isActive ? "active" : ""}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", width: 42, height: 42, borderRadius: 21,
                color: isActive ? "white" : "var(--text-secondary)",
                background: isActive ? "linear-gradient(135deg, var(--brand), #4338CA)" : "transparent",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                position: "relative",
              }}
            >
              <Icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="dock-tooltip">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
