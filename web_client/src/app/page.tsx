"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuthStore } from "@/store/auth";
import { useDashboardStore } from "@/store/dashboard";
import { useTasksStore } from "@/store/tasks";
import { Calendar, Activity, CheckCircle, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { events, activities, isLoading: dashLoading, fetchDashboardData } = useDashboardStore();
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTasksStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchTasks();
    }
  }, [user, fetchDashboardData, fetchTasks]);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".stagger-in");
      gsap.fromTo(
        elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [authLoading, dashLoading, tasksLoading, user]);

  if (authLoading || (user && (dashLoading || tasksLoading))) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // ── PUBLIC LANDING PAGE ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div ref={containerRef} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <h1 className="outfit-font" style={{ fontSize: 18, fontWeight: 800 }}>ISTE SC MBCET</h1>
          </div>
          <Link href="/login" style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
            padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
            textDecoration: "none", boxShadow: "var(--shadow-sm)"
          }}>
            Log In
          </Link>
        </header>

        {/* Hero */}
        <main style={{ flex: 1, padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div className="stagger-in" style={{
            background: "var(--brand-glow)", color: "var(--brand)",
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20,
          }}>
            Executive Management System
          </div>
          <h2 className="stagger-in" style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, lineHeight: 1.1, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
            Where ideas<br />become <span style={{ color: "var(--accent)" }}>actions.</span>
          </h2>
          <p className="stagger-in" style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 400, lineHeight: 1.6, marginBottom: 40 }}>
            The internal operating system for the Executive Committee and Chapter Administration.
          </p>

          <Link href="/login" className="stagger-in" style={{
            background: "linear-gradient(135deg, var(--brand), #4338CA)",
            color: "white", padding: "16px 32px", borderRadius: 16, fontSize: 15, fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 24px rgba(55, 48, 163, 0.25)"
          }}>
            Access Member Portal <ArrowRight size={18} />
          </Link>
        </main>
      </div>
    );
  }

  // ── AUTHENTICATED DASHBOARD ──────────────────────────────────────────────
  const pendingTasks = tasks.filter(t => t.state !== "completed");

  return (
    <div ref={containerRef} style={{ padding: "24px 20px", paddingBottom: "100px" }}>
      {/* Greeting Header */}
      <header className="stagger-in" style={{ marginBottom: "2rem" }}>
        <h1 className="outfit-font text-gradient" style={{ fontSize: 32, fontWeight: 800 }}>
          Good morning, {user.fullName.split(" ")[0]}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 4 }}>
          Here's your society overview for today.
        </p>
      </header>

      {/* Quick Stats Cards */}
      <div className="stagger-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ color: "var(--brand)" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{pendingTasks.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Pending Tasks</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ color: "var(--accent)" }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{user.corePoints}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Core XP</div>
          </div>
        </div>
      </div>

      {/* Quick Actions (General Members) */}
      <div className="stagger-in" style={{ marginBottom: "2.5rem" }}>
        <Link href="/points" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))",
          border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 16, padding: "20px",
          textDecoration: "none", color: "var(--text-primary)", transition: "transform 0.2s"
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#D97706", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={18} /> Submit Point Request
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
              Log your contributions and earn Core XP.
            </p>
          </div>
          <ChevronRight color="#D97706" />
        </Link>
      </div>

      {/* Upcoming Events */}
      <section className="stagger-in" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Events</h2>
          <Link href="/hub" style={{ color: "var(--brand)", fontSize: 13, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center" }}>
            View Hub <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 14 }}>No upcoming events</div>
          ) : events.map((evt) => {
            const d = new Date(evt.date);
            return (
              <div key={evt.id} className="glass-panel" style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ 
                  background: "var(--brand-light)", color: "var(--brand)", 
                  borderRadius: 12, padding: 10, minWidth: 56, textAlign: "center" 
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{d.toLocaleString('default', { month: 'short' })}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{d.getDate()}</div>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{evt.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13 }}>
                    <Calendar size={14} /> {evt.location}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="stagger-in">
        <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h2>
        <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: "center", padding: 10, color: "var(--text-muted)", fontSize: 14 }}>No recent activity</div>
          ) : activities.map((act, idx) => (
            <div key={act.id} style={{ 
              display: "flex", gap: 12, alignItems: "flex-start",
              borderBottom: idx === activities.length - 1 ? "none" : "1px solid var(--border)",
              paddingBottom: idx === activities.length - 1 ? 0 : 16
            }}>
              <div style={{ 
                width: 8, height: 8, borderRadius: "50%", 
                backgroundColor: "var(--accent)", marginTop: 6,
                boxShadow: "0 0 8px var(--accent-glow)"
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, lineHeight: 1.4, color: "var(--text-primary)" }}>
                  <span style={{ fontWeight: 600 }}>{act.user}</span> {act.action}
                </p>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
