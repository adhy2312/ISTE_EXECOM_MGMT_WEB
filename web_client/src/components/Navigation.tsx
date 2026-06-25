"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, CheckSquare, Layers, Home, Zap, Crown, Telescope } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/models";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const NAVLESS_ROUTES = ["/login", "/faculty", "/bootstrap"];

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

  const isChairperson = user.role === UserRole.chapterAdmin || user.email === "adhithyamohans.b24ec1205@mbcet.ac.in";
  const isFaculty = user.role === UserRole.facultyAdvisor;

  const links = [
    { href: "/",            label: "Home",    icon: Home },
    { href: "/leaderboard", label: "Ranks",   icon: Trophy },
    { href: "/hub",         label: "Hub",     icon: Layers },
    ...(isFaculty
      ? [{ href: "/observatory", label: "Observe", icon: Telescope }]
      : isChairperson
        ? [{ href: "/executive", label: "Command", icon: Crown }]
        : [{ href: "/tasks", label: "Tasks", icon: CheckSquare }, { href: "/points", label: "My XP", icon: Zap }]
    ),
  ];

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 0, right: 0, zIndex: 50,
      display: "flex", justifyContent: "center", pointerEvents: "none",
      paddingBottom: "var(--safe-area-inset-bottom)",
    }}>
      <nav ref={navRef} className="glass-panel dock-nav" style={{ 
        display: "flex", alignItems: "center", padding: "8px 12px", gap: 6,
        borderRadius: 40, pointerEvents: "auto", border: "1.5px solid var(--border-strong)" 
      }}>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={`dock-item ${isActive ? "active" : ""}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none", width: 44, height: 44, borderRadius: 22,
              color: isActive ? "white" : "var(--text-secondary)",
              background: isActive ? "linear-gradient(135deg, var(--brand), #4338CA)" : "transparent",
              transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
              position: "relative",
            }}>
              <Icon size={isActive ? 22 : 24} strokeWidth={isActive ? 2.5 : 2} />
              {/* Tooltip on hover is handled by CSS */}
              <span className="dock-tooltip">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
