"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { useTasksStore } from "@/store/tasks";
import { useDashboardStore } from "@/store/dashboard";
import gsap from "gsap";
import {
  Users, CheckSquare, Calendar,
  TrendingUp, Award, BookOpen, LogOut, Telescope
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
  const sortedMembers = [...members].sort((a, b) => b.corePoints - a.corePoints);

  const statCards = [
    { label: "Active Members", value: activeMembers, icon: Users, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
    { label: "Tasks Completed", value: completedTasks, icon: CheckSquare, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
    { label: "Upcoming Events", value: events.length, icon: Calendar, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { label: "Total XP Awarded", value: totalPoints.toLocaleString(), icon: TrendingUp, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  ];

  return (
    <div ref={containerRef} style={{ minHeight: "100dvh", background: "var(--bg)", paddingBottom: 60 }}>
      {/* Top Bar */}
      <div style={{
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)", padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div className="responsive-flex-row-between" style={{ width: "100%", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #0F766E, #047857)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(15,118,110,0.3)" }}>
            <Telescope size={18} color="white" />
          </div>
          <div>
            <h1 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              Faculty Advisor Portal
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, fontWeight: 500 }}>
              {user?.fullName} — Read-Only Overview
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "8px 14px", color: "var(--text-secondary)",
          fontSize: 13, fontWeight: 600, cursor: "pointer"
        }}>
          <LogOut size={14} /> Sign Out
        </button>
        </div>
      </div>

      <div style={{ padding: "32px 20px", maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <h2 className="outfit-font" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>
            Society Overview
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 6, fontWeight: 500 }}>
            Real-time snapshot of ISTE SC MBCET activity and performance.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="fade-up responsive-grid-2" style={{ marginBottom: "2.5rem" }}>
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-panel" style={{ padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: card.bg }}>
                    <Icon size={22} color={card.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {card.label}
                  </span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Snapshot */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <h3 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={20} color="#F59E0B" /> Member Rankings
          </h3>
          <div className="glass-panel" style={{ padding: "8px 16px" }}>
            {sortedMembers.slice(0, 6).map((m, i) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < Math.min(sortedMembers.length, 6) - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: i === 0 ? "linear-gradient(135deg,#F59E0B,#D97706)" : i === 1 ? "linear-gradient(135deg,#94A3B8,#64748B)" : i === 2 ? "linear-gradient(135deg,#D97706,#92400E)" : "var(--bg-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: i < 3 ? "white" : "var(--text-secondary)", flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, fontWeight: 500 }}>{m.designation}</div>
                </div>
                <div style={{ fontWeight: 800, color: "var(--brand)", fontSize: 16, flexShrink: 0 }}>
                  {m.corePoints} <span style={{ fontSize: 10, color: "var(--text-muted)" }}>XP</span>
                </div>
              </div>
            ))}
            {sortedMembers.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No members yet.</div>
            )}
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="fade-up">
          <h3 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={20} color="#2563EB" /> Active Task Snapshot
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="glass-panel" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{task.title}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                    background: task.state === "completed" ? "rgba(5,150,105,0.1)" : "rgba(37,99,235,0.1)",
                    color: task.state === "completed" ? "#059669" : "#2563EB", textTransform: "uppercase"
                  }}>{task.state}</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-muted)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${task.progressPercentage}%`, background: task.state === "completed" ? "#059669" : "var(--brand)", borderRadius: 3, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14, border: "1px dashed var(--border-strong)" }}>
                No active tasks right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
