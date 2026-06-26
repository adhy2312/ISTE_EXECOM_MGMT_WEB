"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy, Layers, Home, Zap, Crown, Telescope,
  User, Settings, Bell, CreditCard, LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { UserRole } from "@/types/models";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const NAVLESS_ROUTES = ["/login", "/bootstrap"];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount, subscribeToNotifications } = useNotificationsStore();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      const unsub = subscribeToNotifications(user.id);
      return unsub;
    }
  }, [user?.id, subscribeToNotifications]);

  if (!user || NAVLESS_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";
  const isAdmin = user.role === UserRole.chapterAdmin || user.email === ROOT_ADMIN;
  const isFaculty = user.role === UserRole.facultyAdvisor;

  // ── Role-based dock items ──
  let links: { href: string; label: string; icon: React.ElementType }[];

  if (isFaculty) {
    links = [
      { href: "/",           label: "Home",      icon: Home },
      { href: "/faculty",    label: "Portal",    icon: Telescope },
      { href: "/observatory",label: "Analytics", icon: Crown },
      { href: "/id",          label: "ID Card",  icon: CreditCard },
    ];
  } else if (isAdmin) {
    links = [
      { href: "/",            label: "Home",     icon: Home },
      { href: "/leaderboard", label: "Ranks",    icon: Trophy },
      { href: "/directory",   label: "Directory",icon: User },
      { href: "/hub",         label: "Hub",      icon: Layers },
      { href: "/executive",   label: "Command",  icon: Crown },
      { href: "/settings",    label: "Settings", icon: Settings },
      { href: "/id",          label: "ID Card",  icon: CreditCard },
    ];
  } else {
    links = [
      { href: "/",            label: "Home",     icon: Home },
      { href: "/leaderboard", label: "Ranks",    icon: Trophy },
      { href: "/directory",   label: "Directory",icon: User },
      { href: "/hub",         label: "Hub",      icon: Layers },
      { href: "/points",      label: "My XP",    icon: Zap },
      { href: "/profile",     label: "Profile",  icon: Settings },
      { href: "/id",          label: "ID Card",  icon: CreditCard },
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

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className={`dock-item ${pathname === "/notifications" ? "active" : ""}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", width: 42, height: 42, borderRadius: 21,
            color: pathname === "/notifications" ? "white" : "var(--text-secondary)",
            background: pathname === "/notifications" ? "linear-gradient(135deg, var(--brand), #4338CA)" : "transparent",
            transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            position: "relative",
          }}
        >
          <Bell size={pathname === "/notifications" ? 20 : 22} strokeWidth={pathname === "/notifications" ? 2.5 : 2} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 8, height: 8, borderRadius: "50%",
              background: "#DC2626", border: "2px solid white",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
          )}
          <span className="dock-tooltip">Alerts</span>
        </Link>

        {/* Global Logout */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to log out?")) {
              logout();
            }
          }}
          className="dock-item"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", width: 42, height: 42, borderRadius: 21, cursor: "pointer",
            color: "var(--text-secondary)", background: "transparent",
            transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", position: "relative",
          }}
        >
          <LogOut size={22} strokeWidth={2} />
          <span className="dock-tooltip">Log Out</span>
        </button>
      </nav>
    </div>
  );
}
