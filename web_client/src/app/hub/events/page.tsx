"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Calendar, ChevronLeft, Plus, MapPin, Users, Clock, CheckSquare, MoreVertical, LayoutList, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHubStore } from "@/store/hub";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function EventsOpsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { events, fetchEvents, addEvent, deleteEvent } = useHubStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: string;
    location: string;
    attendees: number;
    status: "planning" | "upcoming" | "past";
  }>({
    title: "",
    date: "",
    location: "",
    attendees: 0,
    status: "planning"
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [events]);

  const toggleChecklist = () => {
    // Note: Since checklists aren't in the DB schema for now we just handle local or ignore.
    // Full implementation would update Firestore. For now, events don't have checklists on creation.
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addEvent({
        ...newEvent,
        checklists: []
      });
      setIsCreating(false);
      setNewEvent({ title: "", date: "", location: "", attendees: 0, status: "planning" });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleCalendarLink = (evt: import("@/types/hub").HubEvent) => {
    try {
      const title = encodeURIComponent(evt.title || "ISTE Event");
      const details = encodeURIComponent(`Location: ${evt.location || "N/A"}\nAttendees: ${evt.attendees}`);
      const startDate = new Date(evt.date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000 * 2); // 2 hours duration
      const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g,"");
      const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(evt.location)}&dates=${dates}`;
    } catch {
      return "#";
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
              Events Timeline
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "4px", fontWeight: 500 }}>
              Master planning, countdowns & checklists
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="glass-panel" style={{
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

      {events.length === 0 && (
        <div className="fade-up" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 15, fontWeight: 600 }}>
          No events found. Schedule one!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <AnimatePresence>
          {events.map((evt) => {
            const dateObj = new Date(evt.date);
            const daysLeft = getDaysUntil(evt.date);
            const doneCount = evt.checklists?.filter(c => c.done).length || 0;
            const progress = evt.checklists?.length ? (doneCount / evt.checklists.length) * 100 : 0;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
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

                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, position: "relative", zIndex: 10 }}>
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="dropdown-content glass-panel" style={{ minWidth: 150, zIndex: 99999, padding: 8 }}>
                          <DropdownMenu.Item className="dropdown-item" onSelect={() => deleteEvent(evt.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 8, color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
                            <Trash2 size={14} /> Delete Event
                          </DropdownMenu.Item>
                          {evt.status !== 'past' && (
                            <DropdownMenu.Item className="dropdown-item" onSelect={() => window.open(generateGoogleCalendarLink(evt), "_blank")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 8, color: "#2563EB", fontSize: 13, fontWeight: 600 }}>
                              <Calendar size={14} /> Add to Calendar
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
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
                {evt.checklists && evt.checklists.length > 0 && (
                  <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                        <LayoutList size={18} color="var(--brand)" /> Planning Checklist
                      </h4>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>
                        {doneCount} / {evt.checklists.length}
                      </div>
                    </div>

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
                          onClick={() => toggleChecklist()}
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
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setIsCreating(false)}>
          <div className="glass-panel" style={{ width: 450, padding: 24, background: "white" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800 }}>New Event</h2>
              <button onClick={() => setIsCreating(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Event Title</label>
                <input required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="e.g. Tech Symposia" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Date & Time</label>
                  <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Status</label>
                  <select required value={newEvent.status} onChange={e => setNewEvent({...newEvent, status: e.target.value as "planning" | "upcoming" | "past"})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }}>
                    <option value="planning">Planning</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Location</label>
                  <input required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="e.g. Auditorium" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Attendees Cap</label>
                  <input required type="number" value={newEvent.attendees} onChange={e => setNewEvent({...newEvent, attendees: Number(e.target.value)})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
              </div>
              
              <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 14, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Saving..." : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
