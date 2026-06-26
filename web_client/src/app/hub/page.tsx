"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Layers, Calendar, Users, Folder, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/models";

export default function HubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.chapterAdmin;

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".hub-card");
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const hubModules = [
    { title: "Events Ops", icon: Calendar, color: "#2563EB", bg: "rgba(37,99,235,0.1)", href: "/hub/events" },
    { title: "Meetings", icon: Users, color: "#D97706", bg: "rgba(217,119,6,0.1)", href: "/hub/meetings" },
    { title: "Resource Vault", icon: Folder, color: "var(--brand)", bg: "var(--brand-glow)", href: "/hub/vault" },
  ];

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px 20px", maxWidth: 600, margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "28px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", fontWeight: "800" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers color="var(--brand)" size={20} strokeWidth={2.5} />
          </div>
          Operations Hub
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px", fontWeight: 500 }}>
          Central command for ISTE operations
        </p>
      </header>

      {/* App Grid */}
      <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        
        {/* Teams Manager */}
        {isAdmin && (
          <button onClick={() => router.push("/hub/teams")} className="glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: 24, border: "none", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, background: "var(--brand-glow)", width: 100, height: 100, borderRadius: "50%", filter: "blur(20px)" }} />
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Users color="white" size={24} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Execom Structure</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.5 }}>Manage teams, assign leaders, and organize faculty advisors.</p>
          </button>
        )}

        {hubModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.title} href={mod.href} style={{ textDecoration: "none" }}>
              <div 
                className="hub-card glass-panel" 
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: "36px 16px",
                  border: `1px solid var(--border)`, height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s"
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 16, background: mod.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Icon size={32} color={mod.color} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", textAlign: "center" }}>
                  {mod.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
