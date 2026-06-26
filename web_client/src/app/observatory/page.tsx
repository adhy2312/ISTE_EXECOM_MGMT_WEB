"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { UserRole, EnergyPointStatus } from "@/types/models";
import {
  Telescope, Users, Zap, Award, Activity, TrendingUp, Download,
  BarChart2, DollarSign,
} from "lucide-react";
import { usePointsStore } from "@/store/points";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, Legend,
} from "recharts";
import { isRootOrChapterAdmin } from "@/utils/permissions";

type Tab = "overview" | "analytics" | "finance";

// Mock finance data
const BUDGET_DATA = [
  { name: "Tech Fest", allocated: 15000, spent: 11200, category: "Events" },
  { name: "Workshop Series", allocated: 8000, spent: 7500, category: "Education" },
  { name: "Branding", allocated: 5000, spent: 3200, category: "PR" },
  { name: "Infrastructure", allocated: 10000, spent: 6800, category: "Tech" },
];
const BUDGET_CATEGORIES = [
  { name: "Events", value: 38, color: "#7C3AED" },
  { name: "Education", value: 21, color: "#2563EB" },
  { name: "PR", value: 16, color: "#BE185D" },
  { name: "Tech", value: 25, color: "#059669" },
];

export default function ObservatoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { members, fetchMembers, isLoading: membersLoading } = useMembersStore();
  const { requests, fetchAllPending, isLoading: pointsLoading } = usePointsStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!authLoading && user) {
      const isChairperson = isRootOrChapterAdmin(user);
      const isFaculty = user.role === UserRole.facultyAdvisor;
      if (!isChairperson && !isFaculty) {
        router.replace("/");
      } else {
        fetchMembers();
        fetchAllPending();
      }
    }
  }, [user, authLoading, router, fetchMembers, fetchAllPending]);

  useEffect(() => {
    if (!membersLoading && !pointsLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [membersLoading, pointsLoading, activeTab]);

  if (authLoading || membersLoading || pointsLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const activeMembersCount = members.length;
  const totalXP = members.reduce((sum, m) => sum + m.corePoints, 0);
  const pendingCount = requests.filter(r => r.status === EnergyPointStatus.pending).length;
  const approvedCount = requests.filter(r => r.status === EnergyPointStatus.approved).length;
  const topMembers = [...members].sort((a, b) => b.corePoints - a.corePoints).slice(0, 5);

  // Analytics data
  const xpChartData = [...members]
    .sort((a, b) => b.corePoints - a.corePoints)
    .slice(0, 8)
    .map(m => ({ name: m.fullName.split(" ")[0], xp: m.corePoints }));

  // Points by category
  const categoryMap: Record<string, number> = {};
  requests.filter(r => r.status === EnergyPointStatus.approved).forEach(r => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + (r.awardedPoints ?? 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#7C3AED", "#2563EB", "#BE185D", "#059669", "#D97706", "#0F766E", "#4338CA", "#DC2626"];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ISTE SC MBCET - Official Chapter Report", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Active Members: ${activeMembersCount}`, 14, 34);
    doc.text(`Total Chapter Energy (XP): ${totalXP}`, 14, 40);
    doc.text(`Total Energy Requests Processed: ${pendingCount + approvedCount}`, 14, 46);
    autoTable(doc, {
      startY: 54,
      head: [["Rank", "Name", "Designation", "Total XP"]],
      body: [...members].sort((a, b) => b.corePoints - a.corePoints).map((m, i) => [
        `#${i + 1}`, m.fullName, m.designation, m.corePoints.toString()
      ]),
      theme: "grid",
      headStyles: { fillColor: [55, 48, 163] },
    });
    doc.save("ISTE_Chapter_Report.pdf");
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Telescope },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "finance", label: "Finance", icon: DollarSign },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", paddingBottom: 100 }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)", padding: "20px 24px",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div className="responsive-flex-row-between" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #0F766E, #047857)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(15, 118, 110, 0.3)" }}>
            <Telescope size={22} color="white" />
          </div>
          <div>
            <h1 className="outfit-font" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
              Observatory
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>High-level Chapter Operations View</p>
          </div>
        </div>
        <button onClick={generatePDF} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--bg-elevated)", color: "var(--text-primary)",
          border: "1.5px solid var(--border-strong)", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)"
        }}>
          <Download size={15} /> Export PDF
        </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 6, borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.6)" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 16px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
              background: active ? "var(--brand-glow)" : "transparent",
              color: active ? "var(--brand)" : "var(--text-secondary)",
              borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto", width: "100%" }}>

        {/* ════════════════════ OVERVIEW TAB ════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Primary Metric */}
            <div className="glass-panel fade-up" style={{ padding: 28, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", position: "relative", overflow: "hidden", border: "none" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={18} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.9 }}>Total Chapter Energy</span>
                </div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>
                  {totalXP.toLocaleString()} <span style={{ fontSize: 22, fontWeight: 700, opacity: 0.8 }}>XP</span>
                </div>
                <p style={{ fontSize: 14, marginTop: 10, opacity: 0.9, fontWeight: 500 }}>Generated by {activeMembersCount} active members across all domains.</p>
              </div>
              <Zap size={160} color="white" style={{ position: "absolute", right: -24, bottom: -24, opacity: 0.08, transform: "rotate(-15deg)" }} />
            </div>

            {/* Secondary Metrics Grid */}
            <div className="fade-up responsive-grid-3">
              {[
                { label: "Active Members", value: activeMembersCount, icon: Users, color: "#0F766E" },
                { label: "Total Requests", value: pendingCount + approvedCount, icon: Activity, color: "var(--accent)" },
                { label: "Pending Review", value: pendingCount, icon: Zap, color: "#D97706" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glass-panel" style={{ padding: 20 }}>
                    <div style={{ color: stat.color, marginBottom: 12 }}><Icon size={24} /></div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Top Performers */}
            <div className="fade-up">
              <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={18} color="var(--brand)" /> Top Performing Members
              </h2>
              <div className="glass-panel" style={{ padding: "8px 16px" }}>
                {topMembers.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>No members active yet.</div>
                ) : topMembers.map((m, idx) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: idx === topMembers.length - 1 ? "none" : "1px solid var(--border)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: idx === 0 ? "rgba(245,158,11,0.15)" : idx === 1 ? "rgba(148,163,184,0.15)" : idx === 2 ? "rgba(180,83,9,0.15)" : "var(--bg-muted)", color: idx === 0 ? "#D97706" : idx === 1 ? "#64748B" : idx === 2 ? "#92400E" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                      #{idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{m.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2 }}>{m.designation}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand)" }}>{m.corePoints} <span style={{ fontSize: 10, color: "var(--text-muted)" }}>XP</span></div>
                      {/* XP bar */}
                      <div style={{ width: 80, height: 4, background: "var(--bg-muted)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${topMembers[0].corePoints > 0 ? (m.corePoints / topMembers[0].corePoints) * 100 : 0}%`, background: "var(--brand)", borderRadius: 2, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════ ANALYTICS TAB ════════════════════ */}
        {activeTab === "analytics" && (
          <>
            {/* XP Distribution Bar Chart */}
            <div className="glass-panel fade-up" style={{ padding: 24 }}>
              <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                XP Distribution
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 24 }}>Top 8 members by core XP earned</p>
              {xpChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={xpChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: "var(--text-secondary)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <Tooltip
                      contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13, fontWeight: 600 }}
                      cursor={{ fill: "rgba(99,102,241,0.06)" }}
                    />
                    <Bar dataKey="xp" fill="url(#xpGradient)" radius={[6, 6, 0, 0]} name="XP" />
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#4338CA" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No XP data yet.</div>
              )}
            </div>

            {/* Points by Category */}
            <div className="glass-panel fade-up" style={{ padding: 24 }}>
              <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                Points by Category
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 24 }}>Breakdown of approved XP by contribution category</p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RPieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13, fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  </RPieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No approved requests yet to visualize.</div>
              )}
            </div>

            {/* Request Status Summary */}
            <div className="glass-panel fade-up" style={{ padding: 24 }}>
              <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
                Request Status Summary
              </h2>
              <div className="responsive-grid-3">
                {[
                  { label: "Approved", value: approvedCount, color: "#059669", bg: "rgba(5,150,105,0.1)" },
                  { label: "Pending", value: pendingCount, color: "#D97706", bg: "rgba(217,119,6,0.1)" },
                  { label: "Total", value: pendingCount + approvedCount, color: "var(--brand)", bg: "var(--brand-glow)" },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: "20px", background: stat.bg, borderRadius: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: stat.color, textTransform: "uppercase", marginTop: 8, opacity: 0.8 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════ FINANCE TAB ════════════════════ */}
        {activeTab === "finance" && (
          <>
            {/* Budget Overview */}
            <div className="glass-panel fade-up" style={{ padding: 28, background: "linear-gradient(135deg, #059669, #047857)", color: "white", position: "relative", overflow: "hidden", border: "none" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <DollarSign size={18} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.9 }}>Total Budget</span>
                </div>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>
                  ₹{BUDGET_DATA.reduce((s, b) => s + b.allocated, 0).toLocaleString()}
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>Spent</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>₹{BUDGET_DATA.reduce((s, b) => s + b.spent, 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>Remaining</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>₹{BUDGET_DATA.reduce((s, b) => s + (b.allocated - b.spent), 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <DollarSign size={160} color="white" style={{ position: "absolute", right: -24, bottom: -24, opacity: 0.08 }} />
            </div>

            {/* Budget Breakdown */}
            <div className="responsive-grid-2">
              <div className="glass-panel fade-up" style={{ padding: 24 }}>
                <h2 className="outfit-font" style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
                  Budget by Category
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <RPieChart>
                    <Pie data={BUDGET_CATEGORIES} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                      {BUDGET_CATEGORIES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel fade-up" style={{ padding: 24 }}>
                <h2 className="outfit-font" style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
                  Allocated vs Spent
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={BUDGET_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: "var(--text-secondary)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, ""]} />
                    <Bar dataKey="allocated" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Allocated" opacity={0.5} />
                    <Bar dataKey="spent" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event-level Breakdown */}
            <div className="glass-panel fade-up" style={{ padding: 24 }}>
              <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
                Event Budget Tracker
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {BUDGET_DATA.map((b) => {
                  const pct = Math.round((b.spent / b.allocated) * 100);
                  const over = pct > 90;
                  return (
                    <div key={b.name} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2 }}>{b.category}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: over ? "#DC2626" : "#059669" }}>₹{b.spent.toLocaleString()} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/ ₹{b.allocated.toLocaleString()}</span></div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: over ? "#DC2626" : "var(--text-secondary)", marginTop: 2 }}>{pct}% used</div>
                        </div>
                      </div>
                      <div style={{ height: 8, background: "var(--bg-muted)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: over ? "linear-gradient(90deg, #DC2626, #B91C1C)" : "linear-gradient(90deg, #059669, #047857)", borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
