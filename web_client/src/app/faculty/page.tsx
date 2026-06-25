"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { useTasksStore } from "@/store/tasks";
import { useDashboardStore } from "@/store/dashboard";

import gsap from "gsap";
import {
  Users, CheckSquare, Calendar,
  TrendingUp, Award, BookOpen, LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function FacultyPage() {
  const { user, logout } = useAuthStore();
  const { members, fetchMembers } = useMembersStore();
  const { tasks, fetchTasks } = useTasksStore();
  const { events, fetchDashboardData } = useDashboardStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
    fetchTasks();
    fetchDashboardData();
  }, [fetchMembers, fetchTasks, fetchDashboardData]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const completedTasks = tasks.filter(t => t.state === "completed").length;
  const activeMembers = members.filter(m => m.activeStatus === "active").length;
  const totalPoints = members.reduce((sum, m) => sum + m.corePoints, 0);

  const statCards = [
    { label: "Active Members", value: activeMembers, icon: Users, color: "#2563EB" },
    { label: "Tasks Completed", value: completedTasks, icon: CheckSquare, color: "#10B981" },
    { label: "Upcoming Events", value: events.length, icon: Calendar, color: "#F59E0B" },
    { label: "Total XP Awarded", value: totalPoints.toLocaleString(), icon: TrendingUp, color: "#7C3AED" },
  ];

  return (
    <div ref={containerRef} style={{ minHeight: "100dvh", background: "var(--background-dark)", padding: "0 0 60px" }}>
      {/* Top Bar */}
      <div style={{
        background: "rgba(9,9,11,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50
      }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: "#0D9488" }}>
            Faculty Advisor Portal
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {user?.fullName} — Read-Only Overview
          </p>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, padding: "8px 14px", color: "var(--text-secondary)",
          fontSize: 13, fontWeight: 600, cursor: "pointer"
        }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 700 }}>
            Society Overview
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Real-time snapshot of ISTE SC MBCET activity and performance.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "2rem" }}>
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-panel" style={{ padding: "20px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${card.color}22`
                  }}>
                    <Icon size={18} color={card.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {card.label}
                  </span>
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "white", lineHeight: 1 }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Snapshot */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 600 }}>
              <Award size={16} style={{ display: "inline", marginRight: 8, color: "#F59E0B" }} />
              Member Rankings
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.slice(0, 6).map((m, i) => (
              <div key={m.id} className="glass-panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background:
                    i === 0 ? "linear-gradient(135deg,#FFD700,#FDB931)" :
                    i === 1 ? "linear-gradient(135deg,#C0C0C0,#E5E4E2)" :
                    i === 2 ? "linear-gradient(135deg,#CD7F32,#8B4513)" : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: i < 3 ? "#111" : "var(--text-secondary)"
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{m.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.designation}</div>
                </div>
                <div style={{ fontWeight: 700, color: "#38BDF8", fontSize: 16 }}>{m.corePoints} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="fade-up">
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
            <BookOpen size={16} style={{ display: "inline", marginRight: 8, color: "#2563EB" }} />
            Active Task Snapshot
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="glass-panel" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{task.title}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8,
                    background: task.state === "completed" ? "rgba(16,185,129,0.15)" : "rgba(37,99,235,0.15)",
                    color: task.state === "completed" ? "#10B981" : "#60A5FA"
                  }}>{task.state}</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${task.progressPercentage}%`, background: "#2563EB", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
