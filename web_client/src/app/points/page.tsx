"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { usePointsStore } from "@/store/points";
import { EnergyPointStatus, UserRole } from "@/types/models";
import gsap from "gsap";
import { Zap, Plus, Clock, CheckCircle2, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { EnergyPointRequestSchema, validatePayload } from "@/lib/schemas";

const POINT_CATEGORIES = [
  "Event Coordination",
  "Technical Contribution",
  "Workshop Facilitation",
  "Content Creation",
  "Outreach & PR",
  "Design Work",
  "Mentorship",
  "Other",
];

export default function PointsPage() {
  const { user } = useAuthStore();
  const { requests, isLoading, submitRequest, fetchMyRequests } = usePointsStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: POINT_CATEGORIES[0], description: "", proofUrl: "", requestedPoints: 10 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = user?.role === UserRole.chapterAdmin || user?.email === "adhithyamohans.b24ec1205@mbcet.ac.in";

  useEffect(() => {
    if (user) fetchMyRequests(user.id);
  }, [user, fetchMyRequests]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);
    setSubmitting(true);

    const payload = {
      title: form.description.split('\n')[0] || "Energy Point Request",
      points: form.requestedPoints,
      evidenceUrl: form.proofUrl,
      categoryId: form.category,
    };

    const validation = validatePayload(EnergyPointRequestSchema, payload);
    if (!validation.success) {
      setErrorMsg(validation.errors.join(", "));
      setSubmitting(false);
      return;
    }

    try {
      await submitRequest({
        memberId: user.id,
        memberName: user.fullName,
        category: form.category,
        description: form.description,
        proofUrl: form.proofUrl,
        requestedPoints: form.requestedPoints,
      });
      setSuccess(true);
      setShowForm(false);
      setForm({ category: POINT_CATEGORIES[0], description: "", proofUrl: "", requestedPoints: 10 });
      await fetchMyRequests(user.id);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setErrorMsg("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    [EnergyPointStatus.pending]: { color: "#D97706", bg: "rgba(245, 158, 11, 0.1)", icon: <Clock size={14} />, label: "Pending Review" },
    [EnergyPointStatus.approved]: { color: "#059669", bg: "rgba(16, 185, 129, 0.1)", icon: <CheckCircle2 size={14} />, label: "Approved" },
    [EnergyPointStatus.rejected]: { color: "#DC2626", bg: "rgba(239, 68, 68, 0.1)", icon: <XCircle size={14} />, label: "Rejected" },
  };

  const totalApproved = requests
    .filter(r => r.status === EnergyPointStatus.approved)
    .reduce((sum, r) => sum + (r.awardedPoints ?? 0), 0);

  return (
    <div ref={containerRef} style={{ paddingBottom: 100, padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 className="outfit-font" style={{ fontSize: "28px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap color="#F59E0B" size={20} strokeWidth={2.5} />
            </div>
            Energy Points
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8, fontWeight: 500 }}>
            {isAdmin ? "Monitor and approve points in the Command Center." : "Log your contributions and earn Core XP"}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white",
              border: "none", borderRadius: 12, padding: "10px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px var(--brand-glow)"
            }}
          >
            <Plus size={16} /> Apply
          </button>
        )}
      </div>

      {/* My Stats */}
      <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>
        <div className="glass-panel" style={{ padding: 20, border: "1px solid rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Total Earned</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#B45309" }}>{totalApproved} <span style={{ fontSize: 16, fontWeight: 700, color: "#D97706", opacity: 0.8 }}>XP</span></div>
        </div>
        <div className="glass-panel" style={{ padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Submissions</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{requests.length}</div>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 18, color: "#059669", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={18} /> Request submitted! Awaiting PR Head review.
        </div>
      )}

      {/* Submission Form */}
      {showForm && !isAdmin && (
        <div className="glass-panel fade-up" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--brand-glow)" }}>
          <h3 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text-primary)" }}>New Point Request</h3>
          {errorMsg && (
            <div style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
                {POINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>What did you do? <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>(be specific)</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your contribution in detail…"
                required
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Proof / Evidence Link <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>(Optional)</span></label>
              <input
                type="url"
                value={form.proofUrl}
                onChange={e => setForm({ ...form, proofUrl: e.target.value })}
                placeholder="https://drive.google.com/…"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Points Requested: <span style={{ color: "#D97706", fontWeight: 800 }}>{form.requestedPoints} XP</span></label>
              <input
                type="range"
                min={5} max={100} step={5}
                value={form.requestedPoints}
                onChange={e => setForm({ ...form, requestedPoints: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#F59E0B", cursor: "pointer", height: 6 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontWeight: 700 }}>
                <span>5 XP</span><span>100 XP</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="submit" disabled={submitting}
                style={{ flex: 1, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 4px 12px var(--brand-glow)" }}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "14px 20px", background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request History */}
      <div className="fade-up">
        <h3 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>My Requests</h3>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading…</div>
        ) : requests.length === 0 ? (
          <div className="glass-panel" style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-strong)" }}>
            <Zap size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>No requests yet. Submit your first contribution!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {requests.map(req => {
              const sc = statusConfig[req.status];
              return (
                <div key={req.id} className="glass-panel" style={{ padding: "20px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{req.category}</span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 4, lineHeight: 1.4 }}>{req.description.slice(0, 80)}{req.description.length > 80 ? "…" : ""}</h4>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", marginLeft: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {sc.icon} {sc.label}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, fontWeight: 600 }}>
                    <div style={{ color: "var(--text-secondary)" }}>
                      Requested: <strong style={{ color: "#D97706" }}>{req.requestedPoints} XP</strong>
                      {req.awardedPoints != null && (
                        <> <span style={{ opacity: 0.5, margin: "0 6px" }}>•</span> Awarded: <strong style={{ color: "#059669" }}>{req.awardedPoints} XP</strong></>
                      )}
                    </div>
                    {req.proofUrl && (
                      <a href={req.proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--brand)", fontSize: 13, textDecoration: "none", fontWeight: 700 }}>
                        <ExternalLink size={14} /> View Proof
                      </a>
                    )}
                  </div>
                  {req.chairpersonNote && (
                    <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--bg-muted)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)", borderLeft: `3px solid ${sc.color}`, fontWeight: 500, lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Note:</strong> {req.chairpersonNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block"
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-elevated)", border: "1.5px solid var(--border-strong)",
  borderRadius: 12, padding: "14px 16px", color: "var(--text-primary)", fontSize: 14, outline: "none",
  fontFamily: "'Inter',sans-serif", transition: "border-color 0.2s"
};
