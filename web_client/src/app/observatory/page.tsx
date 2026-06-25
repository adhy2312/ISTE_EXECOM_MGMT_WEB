"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { UserRole, EnergyPointStatus } from "@/types/models";
import { Telescope, Users, Zap, Award, Activity, TrendingUp, Download } from "lucide-react";
import { usePointsStore } from "@/store/points";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

export default function ObservatoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { members, fetchMembers, isLoading: membersLoading } = useMembersStore();
  const { requests, fetchAllPending, isLoading: pointsLoading } = usePointsStore(); // fetches all requests for summary
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const isChairperson = user.role === UserRole.chapterAdmin || user.email === "adhithyamohans.b24ec1205@mbcet.ac.in";
      const isFaculty = user.role === UserRole.facultyAdvisor;
      if (!isChairperson && !isFaculty) {
        router.replace("/");
      } else {
        fetchMembers();
        fetchAllPending(); // Assuming this fetches at least pending, or we just rely on members' total XP.
      }
    }
  }, [user, authLoading, router, fetchMembers, fetchAllPending]);

  useEffect(() => {
    if (!membersLoading && !pointsLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [membersLoading, pointsLoading]);

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

  const topMembers = [...members].sort((a, b) => b.corePoints - a.corePoints).slice(0, 3);

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
      head: [['Rank', 'Name', 'Designation', 'Total XP']],
      body: [...members].sort((a, b) => b.corePoints - a.corePoints).map((m, i) => [
        `#${i + 1}`, m.fullName, m.designation, m.corePoints.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [55, 48, 163] } // var(--brand)
    });

    doc.save("ISTE_Chapter_Report.pdf");
  };

  return (
    <div ref={containerRef} style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", paddingBottom: 100 }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="fade-up" style={{ padding: "30px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #0F766E, #047857)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(15, 118, 110, 0.3)" }}>
            <Telescope size={22} color="white" />
          </div>
          <div>
            <h1 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>Faculty Observatory</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>High-level Chapter Operations View</p>
          </div>
        </div>
        <AnalyticsCharts requests={requests} />
        <button onClick={generatePDF} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--bg-elevated)", color: "var(--text-primary)",
          border: "1.5px solid var(--border-strong)", borderRadius: 12, padding: "8px 12px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          boxShadow: "var(--shadow-sm)"
        }}>
          <Download size={14} /> Export PDF
        </button>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ── Primary Metric ── */}
        <div className="glass-panel fade-up" style={{ padding: 24, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", position: "relative", overflow: "hidden", border: "none" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.9 }}>Total Chapter Energy</span>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
              {totalXP.toLocaleString()} <span style={{ fontSize: 20, fontWeight: 700, opacity: 0.8 }}>XP</span>
            </div>
            <p style={{ fontSize: 14, marginTop: 8, opacity: 0.9, fontWeight: 500 }}>Generated by active members across all domains.</p>
          </div>
          <Zap size={140} color="white" style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1, transform: "rotate(-15deg)" }} />
        </div>

        {/* ── Secondary Metrics Grid ── */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ color: "#0F766E", marginBottom: 12 }}><Users size={24} /></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{activeMembersCount}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Active Members</div>
          </div>
          
          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ color: "var(--accent)", marginBottom: 12 }}><Activity size={24} /></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{pendingCount + approvedCount}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Total Requests</div>
          </div>
        </div>

        {/* ── Top Performers ── */}
        <div className="fade-up">
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="var(--brand)" /> Top Performing Members
          </h2>
          <div className="glass-panel" style={{ padding: "8px 16px" }}>
            {topMembers.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>No members active yet.</div>
            ) : topMembers.map((m, idx) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: idx === topMembers.length - 1 ? "none" : "1px solid var(--border)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: idx === 0 ? "rgba(245,158,11,0.15)" : idx === 1 ? "rgba(148,163,184,0.15)" : "rgba(180,83,9,0.15)", color: idx === 0 ? "#D97706" : idx === 1 ? "#64748B" : "#92400E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{m.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{m.designation}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand)" }}>{m.corePoints} <span style={{ fontSize: 10, color: "var(--text-muted)" }}>XP</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
