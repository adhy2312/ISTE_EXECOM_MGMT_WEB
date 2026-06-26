"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuthStore } from "@/store/auth";
import { useDashboardStore } from "@/store/dashboard";
import { useTasksStore } from "@/store/tasks";
import { Calendar, Activity, CheckCircle, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EnergyPointStatus, UserRole } from "@/types/models";
import { isRootOrChapterAdmin } from "@/utils/permissions";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { events, activities, isLoading: dashLoading, fetchDashboardData } = useDashboardStore();
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTasksStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = isRootOrChapterAdmin(user);

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
      <div style={{ padding: "24px 20px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <Skeleton height={60} width="60%" borderRadius={16} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton height={100} borderRadius={20} />
          <Skeleton height={100} borderRadius={20} />
        </div>
        <Skeleton height={120} borderRadius={20} />
        <Skeleton height={200} borderRadius={20} />
        <Skeleton height={150} borderRadius={20} />
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
    <div ref={containerRef} style={{ padding: "24px 20px 100px 20px", maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Greeting Header */}
      <header className="stagger-in mobile-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: 16 }}>
        <div>
          <h1 className="outfit-font text-gradient" style={{ fontSize: 32, fontWeight: 800 }}>
            Good morning, {user.fullName.split(" ")[0]}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 4, fontWeight: 500 }}>
            Here&apos;s your society overview for today.
          </p>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="stagger-in responsive-grid-2">
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "var(--brand-glow)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div style={{ color: "var(--brand)" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{pendingTasks.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Pending Tasks</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "rgba(245, 158, 11, 0.15)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div style={{ color: "#F59E0B" }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{user.corePoints}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Core XP</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stagger-in">
        {isAdmin ? (
          <Link href="/executive" className="glass-panel" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px", textDecoration: "none", color: "var(--text-primary)", transition: "transform 0.2s"
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={18} color="var(--brand)" /> Point Monitor & Approvals
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                Review and approve member contributions.
              </p>
            </div>
            <ChevronRight color="var(--text-muted)" />
          </Link>
        ) : (
          <Link href="/points" className="glass-panel" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px", textDecoration: "none", color: "var(--text-primary)", transition: "transform 0.2s"
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} color="#D97706" /> Submit Point Request
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                Log your contributions and earn Core XP.
              </p>
            </div>
            <ChevronRight color="var(--text-muted)" />
          </Link>
        )}
      </div>

      {/* Two Column Layout for Events & Activity */}
      <div className="responsive-grid-2">
        
        {/* Upcoming Events */}
        <section className="stagger-in glass-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800 }}>Upcoming Events</h2>
            <Link href="/hub" style={{ color: "var(--brand)", fontSize: 13, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center" }}>
              View All
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 14 }}>No upcoming events</div>
            ) : events.map((evt) => {
              const d = new Date(evt.date);
              return (
                <div key={evt.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ 
                    background: "var(--brand-glow)", color: "var(--brand)", 
                    borderRadius: 12, padding: "8px 12px", minWidth: 56, textAlign: "center" 
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.toLocaleString('default', { month: 'short' })}</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{d.getDate()}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{evt.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
                      <Calendar size={14} /> {evt.location}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="stagger-in glass-panel" style={{ padding: 20 }}>
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Recent Activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 14 }}>No recent activity</div>
            ) : activities.map((act, idx) => (
              <div key={act.id} style={{ 
                display: "flex", gap: 12, alignItems: "flex-start",
                borderBottom: idx === activities.length - 1 ? "none" : "1px solid var(--border)",
                paddingBottom: idx === activities.length - 1 ? 0 : 16
              }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: "50%", 
                  backgroundColor: "var(--brand)", marginTop: 6,
                  boxShadow: "0 0 8px var(--brand-glow)"
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.4, color: "var(--text-primary)" }}>
                    <span style={{ fontWeight: 700 }}>{act.user}</span> {act.action}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
