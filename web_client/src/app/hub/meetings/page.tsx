"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

const mockMeetings = [
  { id: 1, title: "ExeCom Core Sync", date: "June 25, 2026", status: "completed", actionItems: 4, completedItems: 4 },
  { id: 2, title: "Symposia Planning", date: "June 29, 2026", status: "upcoming", actionItems: 12, completedItems: 2 },
];

export default function MeetingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} style={{ paddingBottom: 100, padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 8, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <ChevronLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 className="outfit-font" style={{ fontSize: "24px", color: "var(--text-primary)", fontWeight: "800" }}>
            Meetings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", fontWeight: 500 }}>
            Minutes & Action Items
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #D97706, #B45309)", color: "white",
          border: "none", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)"
        }}>
          <Plus size={16} /> New Entry
        </button>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mockMeetings.map((mtg) => (
          <div key={mtg.id} className="glass-panel fade-up" style={{ padding: 20, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{mtg.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  <Clock size={14} color="#D97706" /> {mtg.date}
                </div>
              </div>
              <span style={{ 
                fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", 
                background: mtg.status === 'completed' ? "rgba(5,150,105,0.1)" : "var(--bg-muted)", 
                color: mtg.status === 'completed' ? "#059669" : "var(--text-secondary)",
                padding: "4px 8px", borderRadius: 6 
              }}>
                {mtg.status}
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-elevated)", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-strong)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                <CheckCircle2 size={16} color="#059669" />
                Action Items
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-secondary)" }}>
                <span style={{ color: mtg.completedItems === mtg.actionItems ? "#059669" : "var(--brand)" }}>{mtg.completedItems}</span> / {mtg.actionItems}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
