"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { usePointsStore } from "@/store/points";
import { useEvaluationStore } from "@/store/evaluation";
import { EnergyPointStatus } from "@/types/models";
import gsap from "gsap";
import {
  User, Edit3, Save, X, Plus, ExternalLink,
  CheckCircle2, Clock, XCircle, Zap, Star,
  Target, TrendingUp, ShieldCheck, Calendar,
  Camera, QrCode, Lock, Award,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ── Badge System ──────────────────────────────────────────────────────────────
const BADGE_DEFINITIONS = [
  { id: "first_xp", icon: "⚡", label: "First Spark",        desc: "Earned your first XP",              threshold: 1,   color: "#D97706" },
  { id: "rising",   icon: "🌟", label: "Rising Star",        desc: "Accumulated 50 XP",                 threshold: 50,  color: "#F59E0B" },
  { id: "active",   icon: "🔥", label: "Active Contributor", desc: "Accumulated 150 XP",                threshold: 150, color: "#BE185D" },
  { id: "power",    icon: "💎", label: "Power Exec",         desc: "Accumulated 300 XP",                threshold: 300, color: "#7C3AED" },
  { id: "legend",   icon: "👑", label: "Chapter Legend",     desc: "Accumulated 500 XP",                threshold: 500, color: "#059669" },
  { id: "requests", icon: "📋", label: "Go-Getter",          desc: "Submitted 5+ requests",             threshold: 5,   color: "#2563EB", mode: "count" as const },
];

function BadgeCard({ badge, earned }: { badge: typeof BADGE_DEFINITIONS[0]; earned: boolean }) {
  return (
    <div style={{
      padding: "18px 14px", borderRadius: 20, textAlign: "center",
      background: earned ? `linear-gradient(135deg, ${badge.color}18, ${badge.color}08)` : "rgba(0,0,0,0.03)",
      border: `1.5px solid ${earned ? badge.color + "40" : "var(--border)"}`,
      opacity: earned ? 1 : 0.5, transition: "all 0.3s", position: "relative", overflow: "hidden",
    }}>
      <div style={{ fontSize: 32, marginBottom: 10, filter: earned ? "none" : "grayscale(100%)" }}>
        {earned ? badge.icon : "🔒"}
      </div>
      {!earned && (
        <Lock size={12} color="var(--text-muted)" style={{ position: "absolute", top: 10, right: 10 }} />
      )}
      <div style={{ fontSize: 12, fontWeight: 800, color: earned ? badge.color : "var(--text-muted)", marginBottom: 4 }}>{badge.label}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>{badge.desc}</div>
    </div>
  );
}

// ── Score Ring Component ───────────────────────────────────────────────────
function ScoreRing({ value, max, color, label, size = 76 }: {
  value: number; max: number; color: string; label: string; size?: number;
}) {
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={6} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>/{max}</div>
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", maxWidth: 70 }}>{label}</div>
    </div>
  );
}

const SKILLS_SUGGESTIONS = ["Flutter", "React", "Next.js", "Python", "Figma", "UI/UX", "Video Editing", "Graphic Design", "Public Speaking", "Event Management", "Content Writing", "IoT", "Machine Learning"];

export default function ProfilePage() {
  const { user, firebaseUser } = useAuthStore();
  const { updateMemberProfile } = useMembersStore();
  const { requests, isLoading: pointsLoading, fetchMyRequests } = usePointsStore();
  const { myEvaluation, myContributions, isLoading: evalLoading, fetchMyEvaluation, fetchMyContributions, submitContribution } = useEvaluationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showContribForm, setShowContribForm] = useState(false);
  const [contribForm, setContribForm] = useState({ date: new Date().toISOString().split("T")[0], task: "", proofUrl: "" });
  const [submittingContrib, setSubmittingContrib] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    branchBatch: user?.branchBatch ?? "",
    contact: user?.contact ?? "",
    areasOfExpertise: user?.areasOfExpertise ?? "",
    skills: user?.skills ?? [] as string[],
    newSkill: "",
  });

  useEffect(() => {
    if (user) {
      fetchMyRequests(user.id);
      fetchMyEvaluation(user.id);
      fetchMyContributions(user.id);
      setTimeout(() => setForm({
        fullName: user.fullName,
        branchBatch: user.branchBatch,
        contact: user.contact,
        areasOfExpertise: user.areasOfExpertise,
        skills: user.skills,
        newSkill: "",
      }), 0);
    }
  }, [user, fetchMyRequests, fetchMyEvaluation, fetchMyContributions]);

  useEffect(() => {
    if (!pointsLoading && !evalLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" }
      );
    }
  }, [pointsLoading, evalLoading]);

  if (!user) return null;

  const totalApproved = requests
    .filter(r => r.status === EnergyPointStatus.approved)
    .reduce((s, r) => s + (r.awardedPoints ?? 0), 0);

  const eval_ = myEvaluation;
  const scoreComponents = [
    { label: "Dept.", value: eval_?.departmentScore ?? 0, max: 6, color: "var(--brand)" },
    { label: "Initiative", value: eval_?.initiativeScore ?? 0, max: 2, color: "var(--accent)" },
    { label: "Reliability", value: eval_?.reliabilityScore ?? 0, max: 1, color: "var(--success)" },
    { label: "Attendance", value: eval_?.attendanceScore ?? 0, max: 1, color: "var(--warning)" },
  ];

  const handleSave = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateMemberProfile(firebaseUser.uid, {
        fullName: form.fullName,
        branchBatch: form.branchBatch,
        contact: form.contact,
        areasOfExpertise: form.areasOfExpertise,
        skills: form.skills,
      });
      toast.success("Profile updated!");
      setEditMode(false);
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = form.newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s], newSkill: "" }));
    }
  };

  const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s) }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    setUploadingPhoto(true);
    try {
      await useMembersStore.getState().uploadProfilePicture(user.id, file);
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleContribSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contribForm.task.trim()) return;
    setSubmittingContrib(true);
    try {
      await submitContribution(user.id, {
        date: contribForm.date,
        task: contribForm.task,
        proofUrl: contribForm.proofUrl,
      });
      setContribForm({ date: new Date().toISOString().split("T")[0], task: "", proofUrl: "" });
      setShowContribForm(false);
      toast.success("Contribution logged!");
    } catch {
      toast.error("Failed to submit contribution.");
    } finally {
      setSubmittingContrib(false);
    }
  };

  const statusConfig = {
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

      {/* ── Profile Header Card ─────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "28px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        {/* Decorative gradient bg */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
          {/* Avatar & Upload */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
              background: user.photoURL ? `url(${user.photoURL}) center/cover` : "linear-gradient(135deg, var(--brand), #4338CA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "white",
              boxShadow: "0 8px 24px var(--brand-glow)",
              overflow: "hidden"
            }}>
              {!user.photoURL && user.fullName.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: "50%",
                background: "white", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--brand)", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}
            >
              <Camera size={14} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: "none" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h1 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                {user.fullName}
              </h1>
              <button onClick={() => router.push("/id")} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-elevated)", border: "1px solid var(--brand-glow)", borderRadius: 10, padding: "8px 12px", color: "var(--brand)", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px var(--brand-glow)" }}>
                <QrCode size={16} /> Digital ID
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: "var(--brand-light)", color: "var(--brand)",
              }}>{user.designation}</span>
              {user.branchBatch && (
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {user.branchBatch}
                </span>
              )}
            </div>
          </div>
          {/* Edit Toggle */}
          <button
            onClick={() => { setEditMode(!editMode); setForm({ fullName: user.fullName, branchBatch: user.branchBatch, contact: user.contact, areasOfExpertise: user.areasOfExpertise, skills: user.skills, newSkill: "" }); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: editMode ? "var(--error-light)" : "var(--brand-light)",
              color: editMode ? "var(--error)" : "var(--brand)",
              border: "none", borderRadius: 12, padding: "10px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {editMode ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit</>}
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="responsive-grid-3" style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
          {[
            { label: "Core XP", value: user.corePoints, icon: Zap, color: "#D97706" },
            { label: "XP Approved", value: totalApproved, icon: TrendingUp, color: "var(--success)" },
            { label: "Eval Score", value: `${eval_?.totalScore ?? 0}/10`, icon: Star, color: "var(--brand)" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(255,255,255,0.5)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <Icon size={16} color={stat.color} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Edit Profile Form ─────────────────────────────────────────────────── */}
      {editMode && (
        <div className="glass-panel fade-up" style={{ padding: 24, marginBottom: 20, border: "2px solid var(--brand-glow)" }}>
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <User size={18} color="var(--brand)" /> Edit Profile
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="responsive-grid-2">
              <div>
                <label style={lSt}>Full Name</label>
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} style={inputSt} placeholder="Your full name" />
              </div>
              <div>
                <label style={lSt}>Branch & Batch</label>
                <input value={form.branchBatch} onChange={e => setForm(f => ({ ...f, branchBatch: e.target.value }))} style={inputSt} placeholder="e.g. CS B4 2024" />
              </div>
            </div>
            <div>
              <label style={lSt}>Contact Number</label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} style={inputSt} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={lSt}>Areas of Expertise</label>
              <input value={form.areasOfExpertise} onChange={e => setForm(f => ({ ...f, areasOfExpertise: e.target.value }))} style={inputSt} placeholder="e.g. Web Development, UI/UX Design" />
            </div>
            <div>
              <label style={lSt}>Skills</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {form.skills.map(s => (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--brand-light)", color: "var(--brand)", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                    {s}
                    <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 0, display: "flex" }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={form.newSkill}
                  onChange={e => setForm(f => ({ ...f, newSkill: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  style={{ ...inputSt, flex: 1 }}
                  placeholder="Add a skill…"
                  list="skills-list"
                />
                <datalist id="skills-list">
                  {SKILLS_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
                <button onClick={addSkill} style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <button
              onClick={handleSave} disabled={saving}
              style={{ background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px var(--brand-glow)" }}
            >
              <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* ── Performance Score Card ───────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={18} color="var(--brand)" /> Performance Score
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
              {eval_ ? `Last updated ${new Date(eval_.lastUpdated).toLocaleDateString()}` : "Not yet evaluated"}
            </p>
          </div>
          {/* Total Score Badge */}
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--brand), #4338CA)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px var(--brand-glow)", color: "white",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{eval_?.totalScore ?? 0}</div>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.8 }}>/10</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", gap: 8 }}>
          {scoreComponents.map(c => (
            <ScoreRing key={c.label} value={c.value} max={c.max} color={c.color} label={c.label} />
          ))}
        </div>

        {!eval_ && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--bg-muted)", borderRadius: 12, textAlign: "center", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            Your evaluation score will appear here once the PR Head reviews your contributions.
          </div>
        )}
      </div>

      {/* ── Contribution Log ─────────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} color="var(--success)" /> Contribution Log
          </h2>
          <button
            onClick={() => setShowContribForm(!showContribForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showContribForm ? "var(--error-light)" : "linear-gradient(135deg, var(--success), #15803D)", color: showContribForm ? "var(--error)" : "white", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            {showContribForm ? <><X size={14} /> Close</> : <><Plus size={14} /> Add</>}
          </button>
        </div>

        {/* Submit Form */}
        {showContribForm && (
          <form onSubmit={handleContribSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20, padding: 16, background: "var(--bg-muted)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <div className="responsive-grid-2" style={{ gap: 14 }}>
              <div>
                <label style={lSt}>Date</label>
                <input type="date" value={contribForm.date} onChange={e => setContribForm(f => ({ ...f, date: e.target.value }))} style={inputSt} required />
              </div>
              <div>
                <label style={lSt}>Proof / Evidence Link</label>
                <input type="url" value={contribForm.proofUrl} onChange={e => setContribForm(f => ({ ...f, proofUrl: e.target.value }))} style={inputSt} placeholder="https://drive.google.com/…" />
              </div>
            </div>
            <div>
              <label style={lSt}>What did you contribute?</label>
              <textarea value={contribForm.task} onChange={e => setContribForm(f => ({ ...f, task: e.target.value }))} style={{ ...inputSt, resize: "vertical" }} rows={3} required placeholder="Describe your contribution in detail…" />
            </div>
            <button type="submit" disabled={submittingContrib} style={{ background: "linear-gradient(135deg, var(--success), #15803D)", color: "white", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: submittingContrib ? 0.7 : 1 }}>
              {submittingContrib ? "Submitting…" : "Log Contribution"}
            </button>
          </form>
        )}

        {/* Contribution History */}
        {myContributions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No contributions logged yet. Add your first one!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myContributions.map((c) => {
              const sc = statusConfig[c.status];
              return (
                <div key={c.id} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.5)", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <div className="responsive-flex-row-between" style={{ alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{c.task}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={11} /> {c.date}
                        </span>
                        {c.proofUrl && (
                          <a href={c.proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--brand)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                            <ExternalLink size={11} /> Proof
                          </a>
                        )}
                      </div>
                      {c.adminNote && <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>Note: {c.adminNote}</div>}
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── XP Request History ───────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px" }}>
        <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Zap size={18} color="#D97706" /> XP Request History
        </h2>
        {requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No point requests yet. Submit your first one from the XP page!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.slice(0, 6).map(req => (
              <div key={req.id} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.5)", borderRadius: 14, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {req.description.slice(0, 60)}{req.description.length > 60 ? "…" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{req.category}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: req.status === EnergyPointStatus.approved ? "var(--success)" : req.status === EnergyPointStatus.rejected ? "var(--error)" : "#D97706" }}>
                    {req.status === EnergyPointStatus.approved ? `+${req.awardedPoints}` : req.requestedPoints} XP
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{req.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Badges & Recognition ─────────────────────────────────────────────── */}
      <div className="glass-panel fade-up" style={{ padding: "24px" }}>
        <h2 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Award size={18} color="#F59E0B" /> Badges & Recognition
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 20 }}>Earn badges by contributing and accumulating XP.</p>
        <div className="responsive-grid-3">
          {BADGE_DEFINITIONS.map(badge => {
            const earned = badge.mode === "count"
              ? requests.length >= badge.threshold
              : totalApproved >= badge.threshold;
            return <BadgeCard key={badge.id} badge={badge} earned={earned} />;
          })}
        </div>
      </div>
    </div>
  );
}

const lSt: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontSize: 11, fontWeight: 800, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.06em",
};
