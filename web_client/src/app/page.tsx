"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuthStore } from "@/store/auth";
import { useDashboardStore } from "@/store/dashboard";
import { useTasksStore } from "@/store/tasks";
import { Calendar, Activity, CheckCircle, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { events, activities, isLoading: dashLoading, fetchDashboardData } = useDashboardStore();
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTasksStore();
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div ref={containerRef} style={{ 
        minHeight: "100dvh", 
        display: "flex", 
        flexDirection: "column", 
        backgroundColor: "#05050A", 
        color: "#ffffff",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8))",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated background stars/grid effect */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
          opacity: 0.5,
        }}></div>

        {/* Header */}
        <header style={{ position: "relative", zIndex: 10, padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }} />
            <h1 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>ISTE SC <span style={{color: "#6366F1"}}>MBCET</span></h1>
          </div>
        </header>

        {/* Hero */}
        <main style={{ position: "relative", zIndex: 10, flex: 1, padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          
          <h2 className="stagger-in outfit-font" style={{ fontSize: "clamp(40px, 8vw, 64px)", lineHeight: 1.1, fontWeight: 900, marginBottom: 24, letterSpacing: "-0.02em", color: "#ffffff" }}>
            ORCHESTRATE THE <br />
            <span style={{ 
              background: "linear-gradient(135deg, #818CF8 0%, #C084FC 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(192, 132, 252, 0.4))"
            }}>FUTURE.</span>
          </h2>
          
          <p className="stagger-in" style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.6, marginBottom: 48, fontWeight: 300, letterSpacing: "0.02em" }}>
            Advanced operational matrix for the ISTE Executive Committee. Authenticate to establish connection to the core network.
          </p>

          <Link href="/login" className="stagger-in" style={{
            position: "relative",
            background: "rgba(15, 15, 25, 0.6)",
            color: "white", padding: "18px 40px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
            border: "1px solid rgba(99, 102, 241, 0.5)",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.1)",
            backdropFilter: "blur(12px)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            transition: "all 0.3s ease"
          }}>
            Access ExeCom Portal <ArrowRight size={18} style={{ color: "#818CF8" }} />
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
          Here&apos;s your society overview for today.
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
