"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Calendar, ChevronLeft, Plus, MapPin, Users, Clock, CheckSquare, MoreVertical, LayoutList } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const initialEvents = [
  { id: 1, title: "Tech Symposia 2026", date: "2026-06-28T10:00:00", location: "Main Auditorium", attendees: 120, status: "upcoming", 
    checklists: [
      { id: 'c1', label: "Book Auditorium", done: true },
      { id: 'c2', label: "Confirm Chief Guest", done: true },
      { id: 'c3', label: "Order Refreshments", done: false },
      { id: 'c4', label: "Print Banners", done: false }
    ]
  },
  { id: 2, title: "AI Workshop Series", date: "2026-07-12T14:00:00", location: "CS Lab 3", attendees: 45, status: "planning",
    checklists: [
      { id: 'c5', label: "Prepare VM instances", done: false },
      { id: 'c6', label: "Send out syllabus", done: false }
    ]
  },
];

export default function EventsOpsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const toggleChecklist = (eventId: number, checkId: string) => {
    setEvents(events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          checklists: evt.checklists.map(c => c.id === checkId ? { ...c, done: !c.done } : c)
        };
      }
      return evt;
    }));
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px 20px", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 12, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="outfit-font" style={{ fontSize: "32px", color: "var(--text-primary)", fontWeight: "800" }}>
              Events Timeline
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "4px", fontWeight: 500 }}>
              Master planning, countdowns & checklists
            </p>
          </div>
        </div>
        <button className="glass-panel" style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "white",
          border: "none", borderRadius: 16, padding: "12px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)",
          transition: "transform 0.2s"
        }}>
          <Plus size={18} /> New Event
        </button>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <AnimatePresence>
          {events.map((evt) => {
            const dateObj = new Date(evt.date);
            const daysLeft = getDaysUntil(evt.date);
            const doneCount = evt.checklists.filter(c => c.done).length;
            const progress = (doneCount / evt.checklists.length) * 100;

            return (
              <motion.div 
                layout
                key={evt.id} 
                className="glass-panel fade-up" 
                style={{ border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Event Header */}
                <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: evt.status === 'upcoming' ? "#059669" : "#2563EB", textTransform: "uppercase", letterSpacing: "0.05em", background: evt.status === 'upcoming' ? "rgba(5,150,105,0.1)" : "rgba(37, 99, 235, 0.1)", padding: "4px 8px", borderRadius: 6 }}>
                          {evt.status}
                        </span>
                        {daysLeft > 0 && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>
                            {daysLeft} Days Left
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{evt.title}</h3>
                    </div>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>
                      <Calendar size={16} color="var(--brand)" /> {dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>
                      <Clock size={16} color="var(--brand)" /> {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>
                      <MapPin size={16} color="var(--brand)" /> {evt.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>
                      <Users size={16} color="var(--brand)" /> {evt.attendees} cap
                    </div>
                  </div>
                </div>

                {/* Event Checklists */}
                <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                      <LayoutList size={18} color="var(--brand)" /> Planning Checklist
                    </h4>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>
                      {doneCount} / {evt.checklists.length}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: 6, background: "var(--bg-muted)", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: "100%", background: progress === 100 ? "#059669" : "var(--brand)", borderRadius: 3 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                    {evt.checklists.map(check => (
                      <button 
                        key={check.id}
                        onClick={() => toggleChecklist(evt.id, check.id)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: 12, padding: "12px", 
                          background: check.done ? "rgba(5, 150, 105, 0.05)" : "var(--bg-elevated)", 
                          border: check.done ? "1px solid rgba(5, 150, 105, 0.2)" : "1px solid var(--border)", 
                          borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                        }}
                      >
                        <div style={{ color: check.done ? "#059669" : "var(--text-muted)" }}>
                          {check.done ? <CheckSquare size={18} /> : <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid var(--text-muted)" }} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: check.done ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: check.done ? "line-through" : "none" }}>
                          {check.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
