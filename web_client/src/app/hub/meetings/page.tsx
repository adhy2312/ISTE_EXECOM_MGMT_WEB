"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, CheckCircle2, Clock, Users, FileText, ChevronRight, X, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHubStore } from "@/store/hub";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function MeetingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const { meetings, fetchMeetings, addMeeting, deleteMeeting } = useHubStore();
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    status: "upcoming" as const,
    actionItems: 0,
    completedItems: 0,
    attendance: 0,
    total: 0,
    meetLink: "",
    agendaUrl: "",
    minutesUrl: ""
  });

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [activeTab, meetings]);

  const filteredMeetings = meetings.filter(m => m.status === activeTab);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addMeeting(newMeeting);
      setIsCreating(false);
      setNewMeeting({ title: "", date: "", status: "upcoming", actionItems: 0, completedItems: 0, attendance: 0, total: 0, meetLink: "", agendaUrl: "", minutesUrl: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
              Meetings
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "4px", fontWeight: 500 }}>
              Agendas, Minutes & Action Items
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="glass-panel" style={{
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
      <div className="fade-up glass-panel" style={{ display: "flex", padding: 6, borderRadius: 20, marginBottom: 24, width: "fit-content", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            padding: "10px 24px", borderRadius: 14, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            background: activeTab === "upcoming" ? "white" : "transparent",
            color: activeTab === "upcoming" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: activeTab === "upcoming" ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
          }}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("past")}
          style={{
            padding: "10px 24px", borderRadius: 14, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            background: activeTab === "past" ? "white" : "transparent",
            color: activeTab === "past" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: activeTab === "past" ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
          }}
        >
          Past Log
        </button>
      </div>

      {filteredMeetings.length === 0 && (
        <div className="fade-up" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 15, fontWeight: 600 }}>
          No meetings found in this tab.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <AnimatePresence mode="popLayout">
          {filteredMeetings.map((m) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              key={m.id}
              className="glass-panel fade-up"
              style={{ display: "flex", flexDirection: "column", padding: "20px 24px", border: "1px solid var(--border)", transition: "all 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: m.status === 'upcoming' ? "#059669" : "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", background: m.status === 'upcoming' ? "rgba(5,150,105,0.1)" : "var(--bg-muted)", padding: "4px 8px", borderRadius: 6 }}>
                      {m.status}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={14} /> {new Date(m.date).toLocaleString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{m.title}</h3>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => deleteMeeting(m.id)} style={{ padding: 8, background: "transparent", border: "none", color: "var(--error)", cursor: "pointer" }}>
                    <Trash2 size={18} />
                  </button>
                  {m.meetLink && (
                    <button 
                      onClick={() => window.open(m.meetLink, "_blank")}
                      style={{ 
                        background: "var(--bg-elevated)", border: "1px solid var(--border)", 
                        borderRadius: 12, padding: "8px 16px", color: "var(--text-primary)", 
                        fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        boxShadow: "var(--shadow-sm)"
                      }}
                    >
                      Open Link <ExternalLink size={14} />
                    </button>
                  )}
                  {m.agendaUrl && (
                    <button 
                      onClick={() => window.open(m.agendaUrl, "_blank")}
                      style={{ 
                        background: "var(--brand-glow)", border: "1px solid var(--brand)", 
                        borderRadius: 12, padding: "8px 16px", color: "var(--brand)", 
                        fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      View Agenda <FileText size={14} />
                    </button>
                  )}
                  {m.minutesUrl && (
                    <button 
                      onClick={() => window.open(m.minutesUrl, "_blank")}
                      style={{ 
                        background: "var(--success-light)", border: "1px solid var(--success)", 
                        borderRadius: 12, padding: "8px 16px", color: "var(--success)", 
                        fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      View Minutes <FileText size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16, 185, 129, 0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2 }}>Action Items</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{m.completedItems} / {m.actionItems}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99, 102, 241, 0.1)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2 }}>Attendance</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{m.attendance} / {m.total}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setIsCreating(false)}>
          <div className="glass-panel" style={{ width: 450, padding: 24, background: "white" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800 }}>Schedule Sync</h2>
              <button onClick={() => setIsCreating(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Title</label>
                <input required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="e.g. Core Sync" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Date & Time</label>
                  <input required type="datetime-local" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Status</label>
                  <select required value={newMeeting.status} onChange={e => setNewMeeting({...newMeeting, status: e.target.value as any})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Invited (Total)</label>
                  <input required type="number" value={newMeeting.total} onChange={e => setNewMeeting({...newMeeting, total: Number(e.target.value)})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Action Items</label>
                  <input required type="number" value={newMeeting.actionItems} onChange={e => setNewMeeting({...newMeeting, actionItems: Number(e.target.value)})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Meeting Link (Optional)</label>
                <input type="url" value={newMeeting.meetLink} onChange={e => setNewMeeting({...newMeeting, meetLink: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Agenda URL (Optional)</label>
                <input type="url" value={newMeeting.agendaUrl} onChange={e => setNewMeeting({...newMeeting, agendaUrl: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="https://docs.google.com/..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Minutes URL (Optional)</label>
                <input type="url" value={newMeeting.minutesUrl} onChange={e => setNewMeeting({...newMeeting, minutesUrl: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="https://docs.google.com/..." />
              </div>
              
              <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 14, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Saving..." : "Schedule Sync"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
