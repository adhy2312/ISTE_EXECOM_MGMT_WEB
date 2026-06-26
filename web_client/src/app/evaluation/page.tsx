"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useEvaluationStore } from "@/store/evaluation";
import { UserRole } from "@/types/models";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  BarChart2, ChevronDown, ChevronUp, Star,
  CheckCircle2, Clock, XCircle, ExternalLink,
  Plus, X, Calendar, Info,
} from "lucide-react";
import { toast } from "sonner";
import { isRootOrChapterAdmin } from "@/utils/permissions";

// const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";

function ScoreRing({ value, max, color, label, size = 80 }: {
  value: number; max: number; color: string; label: string; size?: number;
}) {
  const radius = (size / 2) - 9;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={7} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.2,0.8,0.2,1)", filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>/{max}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", maxWidth: 80, textAlign: "center" }}>{label}</div>
    </div>
  );
}

const SCORE_COMPONENTS = [
  { key: "departmentScore" as const, label: "Department Performance", max: 6, color: "var(--brand)", desc: "Quality, quantity, and impact of work completed in your department." },
  { key: "initiativeScore" as const, label: "Initiative & Extra Contribution", max: 2, color: "var(--accent)", desc: "Going beyond assigned work — new ideas, solving problems, volunteering." },
  { key: "reliabilityScore" as const, label: "Reliability & Accountability", max: 1, color: "var(--success)", desc: "Meeting deadlines, responding to communication, following through." },
  { key: "attendanceScore" as const, label: "Attendance & Participation", max: 1, color: "var(--warning)", desc: "Presence at meetings, reviews, and official ISTE activities." },
];

export default function EvaluationPage() {
  const { user } = useAuthStore();
  const { myEvaluation, myContributions, isLoading, fetchMyEvaluation, fetchMyContributions, submitContribution } = useEvaluationStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAdmin = isRootOrChapterAdmin(user);

  const [showSystem, setShowSystem] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], task: "", proofUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  // Admin assigns scores — redirect them to the Evaluation Manager in Settings
  useEffect(() => {
    if (user && isAdmin) {
      router.replace("/settings");
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchMyEvaluation(user.id);
      fetchMyContributions(user.id);
    }
  }, [user, isAdmin, fetchMyEvaluation, fetchMyContributions]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.task.trim()) return;
    setSubmitting(true);
    try {
      await submitContribution(user.id, { date: form.date, task: form.task, proofUrl: form.proofUrl });
      setForm({ date: new Date().toISOString().split("T")[0], task: "", proofUrl: "" });
      setShowForm(false);
      toast.success("Contribution logged successfully!");
    } catch {
      toast.error("Failed to submit contribution.");
    } finally {
      setSubmitting(false);
    }
  };

  const evalData = myEvaluation;
  const totalScore = evalData?.totalScore ?? 0;
  const totalMax = 10;
  const pct = totalScore / totalMax;

  const statusCfg = {
    pending: { color: "#D97706", bg: "rgba(245,158,11,0.1)", icon: <Clock size={12} />, label: "Pending" },
    verified: { color: "var(--success)", bg: "var(--success-light)", icon: <CheckCircle2 size={12} />, label: "Verified" },
    rejected: { color: "var(--error)", bg: "var(--error-light)", icon: <XCircle size={12} />, label: "Rejected" },
  };

  const inputSt: React.CSSProperties = {
    width: "100%", background: "var(--bg-elevated)", border: "1.5px solid var(--border-strong)",
    borderRadius: 12, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  };

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={22} color="var(--brand)" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="outfit-font" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
              Performance Evaluation
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
              Transparent · Evidence-based · Fair
            </p>
          </div>
        </div>
      </header>

      {/* ── Total Score Hero ──────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "28px 24px", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, var(--brand-glow) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Big Score */}
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span className="outfit-font" style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, var(--brand), #4338CA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {totalScore}
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text-secondary)" }}>/10</span>
          </div>
          {/* Progress Bar */}
          <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden", maxWidth: 300, margin: "0 auto 16px" }}>
            <div style={{ height: "100%", width: `${pct * 100}%`, background: "linear-gradient(to right, var(--brand), #4338CA)", borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
            {evalData ? `Last updated ${new Date(evalData.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}` : "Score not yet assigned by PR Head"}
          </p>
        </div>
      </div>

      {/* ── Score Component Rings ─────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px", marginBottom: 20 }}>
        <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={18} color="var(--brand)" /> Score Breakdown
        </h2>
        <div className="responsive-grid-4" style={{ gap: 8, justifyItems: "center" }}>
          {SCORE_COMPONENTS.map(c => (
            <ScoreRing
              key={c.key}
              value={evalData?.[c.key] ?? 0}
              max={c.max}
              color={c.color}
              label={c.label.split(" ")[0]}
            />
          ))}
        </div>

        {/* Table breakdown */}
        <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          {SCORE_COMPONENTS.map((c, i) => {
            const val = evalData?.[c.key] ?? 0;
            return (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < SCORE_COMPONENTS.length - 1 ? 12 : 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{c.label}</div>
                  <div style={{ height: 5, background: "rgba(0,0,0,0.06)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(val / c.max) * 100}%`, background: c.color, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.color, minWidth: 40, textAlign: "right" }}>{val}/{c.max}</div>
              </div>
            );
          })}
        </div>

        {/* Event Allocations Breakdown */}
        {evalData?.eventAllocations && evalData.eventAllocations.length > 0 && (
          <div style={{ marginTop: 24, padding: 16, background: "var(--bg-muted)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
               Event Points
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {evalData.eventAllocations.map(ev => (
                <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.6)", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>{ev.eventName}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--brand)" }}>+{ev.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Contribution Log ──────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
            Contribution Log
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showForm ? "var(--error-light)" : "linear-gradient(135deg, var(--brand), #4338CA)", color: showForm ? "var(--error)" : "white", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: showForm ? "none" : "0 4px 12px var(--brand-glow)" }}
          >
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Log Entry</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "var(--bg-muted)", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lSt}>Date of Contribution</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputSt} required />
              </div>
              <div>
                <label style={lSt}>Proof / Evidence Link</label>
                <input type="url" value={form.proofUrl} onChange={e => setForm(f => ({ ...f, proofUrl: e.target.value }))} style={inputSt} placeholder="https://drive.google.com/…" />
              </div>
            </div>
            <div>
              <label style={lSt}>Contribution Description</label>
              <textarea value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} rows={3} style={{ ...inputSt, resize: "vertical" }} required placeholder="Describe exactly what you did and its impact…" />
            </div>
            <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting…" : "Submit to Log"}
            </button>
          </form>
        )}

        {myContributions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No contributions logged yet. Add your first entry above!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myContributions.map(c => {
              const sc = statusCfg[c.status];
              return (
                <div key={c.id} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.5)", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>{c.task}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Calendar size={11} /> {c.date}
                        </span>
                        {c.proofUrl && (
                          <a href={c.proofUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                            <ExternalLink size={11} /> Proof
                          </a>
                        )}
                      </div>
                      {c.adminNote && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-muted)", borderRadius: 8, padding: "6px 10px", borderLeft: `3px solid ${sc.color}` }}>
                          Admin note: {c.adminNote}
                        </div>
                      )}
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── About the System ─────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "20px 24px" }}>
        <button
          onClick={() => setShowSystem(!showSystem)}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}
        >
          <h2 className="outfit-font" style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Info size={17} color="var(--text-secondary)" /> How Evaluation Works
          </h2>
          {showSystem ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
        </button>

        {showSystem && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {SCORE_COMPONENTS.map(c => (
              <div key={c.key} style={{ padding: "14px 16px", background: "var(--bg-muted)", borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.color, background: `${c.color}15`, padding: "3px 10px", borderRadius: 20 }}>{c.max} marks</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
            <div style={{ padding: "14px 16px", background: "var(--brand-glow)", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", lineHeight: 1.6, margin: 0 }}>
                <strong>Core Principle:</strong> The system does not measure who completed the most tasks — it measures who created the most value for ISTE. Every evaluation is based on verified evidence.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const lSt: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontSize: 11, fontWeight: 800, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.06em",
};
