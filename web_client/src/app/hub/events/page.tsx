"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Calendar, ChevronLeft, Plus, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";

const mockEvents = [
  { id: 1, title: "Tech Symposia 2026", date: "June 28", time: "10:00 AM", location: "Main Auditorium", attendees: 120, status: "upcoming" },
  { id: 2, title: "AI Workshop Series", date: "July 12", time: "02:00 PM", location: "CS Lab 3", attendees: 45, status: "planning" },
];

export default function EventsOpsPage() {
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
            Events Ops
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", fontWeight: 500 }}>
            Plan and track symposia & workshops
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "white",
          border: "none", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
        }}>
          <Plus size={16} /> Create
        </button>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mockEvents.map((evt) => (
          <div key={evt.id} className="glass-panel fade-up" style={{ padding: 20, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: evt.status === 'upcoming' ? "#059669" : "#D97706", textTransform: "uppercase", letterSpacing: "0.05em", background: evt.status === 'upcoming' ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)", padding: "4px 8px", borderRadius: 6 }}>
                  {evt.status}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>{evt.title}</h3>
              </div>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                <Calendar size={14} color="var(--brand)" /> {evt.date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                <Clock size={14} color="var(--brand)" /> {evt.time}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                <MapPin size={14} color="var(--brand)" /> {evt.location}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                <Users size={14} color="var(--brand)" /> {evt.attendees} cap
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
