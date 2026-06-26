"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, CheckCircle2, Clock, Users, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const mockMeetings = [
  { id: 1, title: "ExeCom Core Sync", date: "June 25, 2026", status: "past", actionItems: 4, completedItems: 4, attendance: 12, total: 15 },
  { id: 2, title: "Symposia Planning", date: "June 29, 2026", status: "upcoming", actionItems: 12, completedItems: 2, attendance: 0, total: 20 },
  { id: 3, title: "Budget Allocation Q3", date: "July 5, 2026", status: "upcoming", actionItems: 5, completedItems: 0, attendance: 0, total: 8 },
  { id: 4, title: "Website Launch Debrief", date: "June 10, 2026", status: "past", actionItems: 8, completedItems: 8, attendance: 14, total: 15 },
];

export default function MeetingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [activeTab]);

  const filteredMeetings = mockMeetings.filter(m => m.status === activeTab);

  return (
    <div ref={containerRef} style={{ paddingBottom: 100, padding: "20px 20px 100px", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 12, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="outfit-font" style={{ fontSize: "32px", color: "var(--text-primary)", fontWeight: "800" }}>
              Meetings
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "4px", fontWeight: 500 }}>
              Agendas, Minutes & Action Items
            </p>
          </div>
        </div>
        <button className="glass-panel" style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white",
          border: "none", borderRadius: 16, padding: "12px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
          transition: "transform 0.2s"
        }}>
          <Plus size={18} /> Schedule Sync
        </button>
      </header>

      {/* Custom Tab Switcher */}
      <div className="fade-up" style={{ display: "flex", gap: 8, background: "var(--bg-elevated)", padding: 6, borderRadius: 20, width: "fit-content", marginBottom: 32, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <button 
          onClick={() => setActiveTab("upcoming")}
          style={{
            position: "relative", padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            background: "transparent", border: "none", color: activeTab === "upcoming" ? "var(--brand)" : "var(--text-secondary)",
            zIndex: 1, outline: "none", transition: "color 0.3s"
          }}
        >
          {activeTab === "upcoming" && (
            <motion.div layoutId="meetingTabBg" style={{ position: "absolute", inset: 0, background: "var(--brand-glow)", borderRadius: 16, zIndex: -1 }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab("past")}
          style={{
            position: "relative", padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            background: "transparent", border: "none", color: activeTab === "past" ? "var(--brand)" : "var(--text-secondary)",
            zIndex: 1, outline: "none", transition: "color 0.3s"
          }}
        >
          {activeTab === "past" && (
            <motion.div layoutId="meetingTabBg" style={{ position: "absolute", inset: 0, background: "var(--brand-glow)", borderRadius: 16, zIndex: -1 }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          Past Records
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
        <AnimatePresence mode="popLayout">
          {filteredMeetings.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: 15, fontWeight: 500 }}
             >
               No {activeTab} meetings found.
             </motion.div>
          ) : filteredMeetings.map((mtg) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={mtg.id} 
              className="glass-panel" 
              style={{ padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>{mtg.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                    <Clock size={14} color="var(--brand)" /> {mtg.date}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "var(--bg-muted)", padding: "12px 16px", borderRadius: 16, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                    <Users size={14} /> Attendance
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                    {mtg.status === "past" ? `${mtg.attendance}/${mtg.total}` : "Pending"}
                  </div>
                </div>

                <div style={{ flex: 1, background: mtg.completedItems === mtg.actionItems && mtg.actionItems > 0 ? "rgba(5,150,105,0.1)" : "var(--bg-muted)", padding: "12px 16px", borderRadius: 16, border: mtg.completedItems === mtg.actionItems && mtg.actionItems > 0 ? "1px solid rgba(5,150,105,0.2)" : "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: mtg.completedItems === mtg.actionItems && mtg.actionItems > 0 ? "#059669" : "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                    <CheckCircle2 size={14} /> Action Items
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: mtg.completedItems === mtg.actionItems && mtg.actionItems > 0 ? "#059669" : "var(--text-primary)" }}>
                    {mtg.completedItems} <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/ {mtg.actionItems}</span>
                  </div>
                </div>
              </div>

              <button style={{ 
                background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-strong)", 
                padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} color="var(--brand)" /> View Agenda & Minutes</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
