"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { usePointsStore } from "@/store/points";
import { useAdminStore } from "@/store/admin";
import { useTasksStore } from "@/store/tasks";
import { EnergyPointStatus, UserRole, ExecomMember } from "@/types/models";
import gsap from "gsap";
import {
  Crown, Zap, CheckCircle2, XCircle,
  ExternalLink, Clock, BarChart2, LogOut, ChevronRight,
  ShieldCheck, PlusCircle, Trash2, Edit3, Save, X,
  ToggleLeft, ToggleRight, Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

type Tab = "overview" | "analytics" | "approvals" | "members" | "access" | "builder";

// ── Role metadata (Light theme tailored) ──────────────────────────────────
const ROLE_OPTIONS: { value: UserRole; label: string; color: string; bg: string }[] = [
  { value: UserRole.chapterAdmin,  label: "PR Head",         color: "#4338CA", bg: "rgba(67,56,202,0.1)" },
  { value: UserRole.secretary,     label: "Secretary",        color: "#5B21B6", bg: "rgba(91,33,182,0.1)" },
  { value: UserRole.treasurer,     label: "Treasurer",        color: "#0369A1", bg: "rgba(3,105,161,0.1)" },
  { value: UserRole.techHead,      label: "Tech Head",        color: "#1D4ED8", bg: "rgba(29,78,216,0.1)" },
  { value: UserRole.prMedia,       label: "PR & Media",       color: "#BE185D", bg: "rgba(190,24,93,0.1)" },
  { value: UserRole.execomCore,    label: "ExeCom Core",      color: "#047857", bg: "rgba(4,120,87,0.1)" },
  { value: UserRole.generalMember, label: "General Member",   color: "#475569", bg: "rgba(71,85,105,0.1)" },
  { value: UserRole.facultyAdvisor,label: "Faculty Advisor",  color: "#0F766E", bg: "rgba(15,118,110,0.1)" },
];

const getRoleConfig = (role: UserRole) =>
  ROLE_OPTIONS.find((r) => r.value === role) ?? ROLE_OPTIONS[6];

// ── Empty form state ───────────────────────────────────────────────────────
const emptyForm = { email: "", role: UserRole.generalMember, designation: "" };

export default function ExecutivePage() {
  const { user, logout } = useAuthStore();
  const { members, teams, fetchMembers, fetchTeams, createTeam, deleteTeam } = useMembersStore();
  const { requests, isLoading: pointsLoading, fetchAllPending, approveRequest, rejectRequest } = usePointsStore();
  const {
    allowedUsers, isLoading: adminLoading,
    subscribeToAllowedUsers, addAllowedUser, updateAllowedUser, removeAllowedUser,
  } = useAdminStore();
  const { tasks, fetchTasks } = useTasksStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  // Builder state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [builderEditForm, setBuilderEditForm] = useState<Partial<ExecomMember>>({});
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [addingMemberToTeam, setAddingMemberToTeam] = useState<string | null>(null);
  const [newMemberForm, setNewMemberForm] = useState({ email: "", fullName: "", role: UserRole.generalMember, designation: "", branchBatch: "", department: "" });

  // Approval states
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [awardPoints, setAwardPoints] = useState(0);
  const [processing, setProcessing] = useState(false);
  // Access control states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editEmail, setEditEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ role: UserRole; designation: string }>({ role: UserRole.generalMember, designation: "" });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.role !== UserRole.chapterAdmin && user.email !== "adhithyamohans.b24ec1205@mbcet.ac.in") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    fetchMembers();
    fetchTeams();
    fetchAllPending();
    fetchTasks();
    const unsub = subscribeToAllowedUsers();
    return () => unsub();
  }, [fetchMembers, fetchTeams, fetchAllPending, fetchTasks, subscribeToAllowedUsers]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" }
      );
    }
  }, [activeTab]);

  const handleLogout = async () => { await logout(); router.replace("/login"); };
  const pendingRequests = requests.filter((r) => r.status === EnergyPointStatus.pending);
  const totalXP = members.reduce((s, m) => s + m.corePoints, 0);

  const handleApprove = async (req: typeof requests[0]) => {
    setProcessing(true);
    try {
      await approveRequest(req.id, awardPoints || req.requestedPoints, reviewNote, req.memberId, user!.id);
      setReviewId(null); setReviewNote(""); setAwardPoints(0);
    } finally { setProcessing(false); }
  };
  const handleReject = async (req: typeof requests[0]) => {
    setProcessing(true);
    try {
      await rejectRequest(req.id, reviewNote, user!.id);
      setReviewId(null); setReviewNote("");
    } finally { setProcessing(false); }
  };

  // ── Access control handlers ────────────────────────────────────────────
  const handleAddUser = async () => {
    setAddError("");
    if (!addForm.email.endsWith("@mbcet.ac.in")) {
      setAddError("Email must be an @mbcet.ac.in address.");
      return;
    }
    if (!addForm.designation.trim()) {
      setAddError("Please enter a designation.");
      return;
    }
    setAddLoading(true);
    try {
      await addAllowedUser({
        email: addForm.email.toLowerCase().trim(),
        role: addForm.role,
        designation: addForm.designation.trim(),
        isActive: true,
        addedBy: user?.id ?? "admin",
      });
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (e) {
      setAddError((e as Error).message);
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (u: typeof allowedUsers[0]) => {
    setEditEmail(u.email);
    setEditForm({ role: u.role, designation: u.designation });
  };
  const saveEdit = async () => {
    if (!editEmail) return;
    await updateAllowedUser(editEmail, editForm);
    setEditEmail(null);
  };

  const toggleActive = async (email: string, current: boolean) => {
    await updateAllowedUser(email, { isActive: !current });
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview",  label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "approvals", label: "Approvals", count: pendingRequests.length },
    { id: "members",   label: "Members" },
    { id: "builder",   label: "ExeCom Builder" },
    { id: "access",    label: "Access Control" },
  ];

  // ── Shared input style ────────────────────────────────────────────────
  const inputSt: React.CSSProperties = {
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16, padding: "12px 16px", color: "var(--text-primary)", fontSize: 14,
    outline: "none", width: "100%", transition: "all 0.2s",
    boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.02)"
  };
  const selectSt: React.CSSProperties = { ...inputSt };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* ── Sticky Top Bar ─────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(0,0,0,0.04)", padding: "16px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, var(--brand), #4338CA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px var(--brand-glow)" }}>
            <Crown size={18} color="white" />
          </div>
          <div>
            <h1 className="outfit-font text-gradient" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Command Center</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{user?.designation}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 14, padding: "8px 16px", color: "var(--text-secondary)",
          fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}>
          <LogOut size={14} /> Out
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: 8, borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 16px", borderRadius: "12px 12px 0 0",
            border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
            background: activeTab === t.id ? "var(--brand-glow)" : "transparent",
            color: activeTab === t.id ? "var(--brand)" : "var(--text-secondary)",
            borderBottom: activeTab === t.id ? "2px solid var(--brand)" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span style={{ marginLeft: 8, background: "var(--accent)", color: "white", borderRadius: 20, padding: "2px 8px", fontSize: 10 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div ref={containerRef} style={{ padding: "24px 20px 100px 20px", maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                  */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            <div className="fade-up" style={{ marginBottom: "2rem" }}>
              <h2 className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>
                Welcome back, {user?.fullName.split(" ")[0]}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 4 }}>Here&apos;s the full picture at a glance.</p>
            </div>
            
            <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>
              {[
                { label: "Allowed Users",      value: allowedUsers.length,           color: "var(--brand)", icon: ShieldCheck },
                { label: "Pending Approvals",   value: pendingRequests.length,        color: "var(--accent)", icon: Clock },
                { label: "Total XP Issued",     value: totalXP.toLocaleString(),      color: "#059669", icon: BarChart2 },
                { label: "My Points",           value: user?.corePoints ?? 0,         color: "#0284C7", icon: Zap },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="glass-panel" style={{ padding: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={card.color} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{card.value}</div>
                  </div>
                );
              })}
            </div>
            
            {pendingRequests.length > 0 && (
              <div className="fade-up glass-panel" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.05)" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "var(--accent)" }}>⚡ {pendingRequests.length} point request{pendingRequests.length > 1 ? "s" : ""} awaiting your approval</div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Review and decide — members are waiting!</div>
                </div>
                <button onClick={() => setActiveTab("approvals")} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "var(--accent)", border: "none",
                  borderRadius: 12, padding: "10px 16px", color: "white",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px var(--accent-glow)"
                }}>
                  Review <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ANALYTICS TAB                                                 */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="fade-up">
            <AnalyticsDashboard members={members} teams={teams} requests={requests} tasks={tasks} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* APPROVALS TAB                                                 */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "approvals" && (
          <>
            <h2 className="outfit-font fade-up" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Point Approval Queue</h2>
            {pointsLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading requests…</div>
            ) : requests.length === 0 ? (
              <div className="glass-panel fade-up" style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={48} style={{ margin: "0 auto 16px", color: "var(--border-strong)" }} strokeWidth={1.5} />
                <p style={{ fontSize: 16, fontWeight: 500 }}>All caught up! No requests to review.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {requests.map((req) => {
                  const isExpanded = reviewId === req.id;
                  const isPending = req.status === EnergyPointStatus.pending;
                  return (
                    <div key={req.id} className="glass-panel fade-up" style={{ padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase",
                              background: isPending ? "rgba(245,158,11,0.1)" : req.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                              color: isPending ? "#D97706" : req.status === "approved" ? "#059669" : "#DC2626",
                            }}>{req.status}</span>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{req.category}</span>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{req.memberName}</div>
                          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{req.description}</p>
                          {req.proofUrl && (
                            <a href={req.proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary-blue)", fontSize: 13, textDecoration: "none", fontWeight: 700, marginTop: 10 }}>
                              <ExternalLink size={14} /> View Proof Document
                            </a>
                          )}
                        </div>
                        <div style={{ textAlign: "right", minWidth: 90 }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>{req.requestedPoints}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>XP req.</div>
                          {req.awardedPoints != null && (
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 6 }}>+{req.awardedPoints} XP</div>
                          )}
                        </div>
                      </div>
                      {isPending && (
                        <div style={{ marginTop: 20 }}>
                          {!isExpanded ? (
                            <button onClick={() => { setReviewId(req.id); setAwardPoints(req.requestedPoints); }}
                              style={{ width: "100%", background: "var(--brand-glow)", border: "1.5px solid rgba(79, 70, 229, 0.2)", borderRadius: 12, padding: "12px", color: "var(--brand)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                              Review Request
                            </button>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                              <div>
                                <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Award XP: <span style={{ color: "var(--accent)", fontSize: 15 }}>{awardPoints} XP</span></label>
                                <input type="range" min={0} max={req.requestedPoints} step={5} value={awardPoints} onChange={(e) => setAwardPoints(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer", marginBottom: 16 }} />
                              </div>
                              <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Admin note (optional)" rows={2}
                                style={{ width: "100%", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "12px 16px", color: "var(--text-primary)", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.02)" }} />
                              <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => handleApprove(req)} disabled={processing}
                                  style={{ flex: 1, background: "#10B981", border: "none", borderRadius: 12, padding: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
                                  <CheckCircle2 size={16} /> Approve +{awardPoints} XP
                                </button>
                                <button onClick={() => handleReject(req)} disabled={processing}
                                  style={{ flex: 1, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 14, color: "#EF4444", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                  <XCircle size={16} /> Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* MEMBERS TAB                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "members" && (
          <>
            <h2 className="outfit-font fade-up" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Member Roster</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {members.map((m) => (
                <div key={m.id} className="glass-panel fade-up" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand), #4338CA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white", flexShrink: 0, boxShadow: "var(--shadow-sm)" }}>
                    {m.fullName.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.fullName}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, fontWeight: 500 }}>{m.designation} <span style={{ opacity: 0.5 }}>·</span> {m.department}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--brand)" }}>{m.corePoints}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>XP</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* EXECOM BUILDER TAB                                            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "builder" && (
          <>
            <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={24} color="var(--brand)" /> ExeCom Builder
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Manage sections, add new teams, and structure members.</p>
              </div>
            </div>

            {/* Create Team Form */}
            <div className="glass-panel fade-up" style={{ padding: "20px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
              <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="New Team Name" style={{ flex: 1, ...inputSt }} />
              <input value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="Team Description" style={{ flex: 2, ...inputSt }} />
              <button 
                onClick={async () => {
                  if(!newTeamName) return;
                  await createTeam(newTeamName, newTeamDesc);
                  setNewTeamName(""); setNewTeamDesc("");
                }} 
                style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 700, cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}>
                <PlusCircle size={16} /> Add Team
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {teams.map(team => {
                // Find allowed users that belong to this team
                const teamUsers = allowedUsers.filter(u => u.teamId === team.id);
                // The actual profile from members if they have logged in
                const teamMembers = members.filter(m => m.teamId === team.id);

                return (
                  <div key={team.id} className="glass-panel fade-up" style={{ padding: 24, background: "rgba(255,255,255,0.7)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
                      <div>
                        <h3 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{team.name}</h3>
                        {team.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{team.description}</p>}
                      </div>
                      <button onClick={() => { if(confirm("Delete team?")) deleteTeam(team.id); }} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}><Trash2 size={18} /></button>
                    </div>

                    {/* Team Members List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      {teamUsers.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No members in this team.</p>
                      ) : (
                        teamUsers.map(u => {
                          const profile = teamMembers.find(m => m.email === u.email);
                          const rc = getRoleConfig(u.role);
                          const isEditing = editingMemberId === (profile?.id ?? u.email);
                          
                          if (isEditing) {
                            return (
                              <div key={u.email} className="glass-panel" style={{ padding: 16, border: "1px solid var(--brand-glow)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                  <span style={{ fontSize: 14, fontWeight: 700 }}>Editing: {u.fullName || u.email}</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                  <div><label style={labelSt}>Full Name</label><input value={builderEditForm.fullName ?? ""} onChange={e => setBuilderEditForm(f => ({ ...f, fullName: e.target.value }))} style={inputSt} /></div>
                                  <div><label style={labelSt}>Designation</label><input value={builderEditForm.designation ?? ""} onChange={e => setBuilderEditForm(f => ({ ...f, designation: e.target.value }))} style={inputSt} /></div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                  <button onClick={async () => {
                                    if(profile) {
                                      await useMembersStore.getState().updateMemberProfile(profile.id, builderEditForm);
                                    }
                                    await updateAllowedUser(u.email, { designation: builderEditForm.designation, fullName: builderEditForm.fullName });
                                    setEditingMemberId(null);
                                  }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#10B981", border: "none", borderRadius: 8, padding: "8px 14px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Save size={14} /> Save</button>
                                  <button onClick={() => setEditingMemberId(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><X size={14} /> Cancel</button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={u.email} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px", borderRadius: 12, background: "white", border: "1px solid var(--border-strong)" }}>
                              <div style={{ width: 40, height: 40, borderRadius: "50%", background: profile?.photoURL ? `url(${profile.photoURL}) center/cover` : `linear-gradient(135deg, ${rc.color}, ${rc.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0 }}>
                                {!profile?.photoURL && (u.fullName?.[0] || u.email[0].toUpperCase())}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                                  {u.fullName || u.email}
                                  {!profile && <span style={{ fontSize: 10, background: "var(--warning-light)", color: "var(--warning)", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>PENDING LOGIN</span>}
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 6, background: rc.bg, color: rc.color }}>{rc.label}</span>
                                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{u.designation}</span>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</span>
                                </div>
                              </div>
                              <button onClick={() => {
                                setEditingMemberId(profile?.id ?? u.email);
                                setBuilderEditForm({ fullName: profile?.fullName ?? u.fullName, designation: profile?.designation ?? u.designation });
                              }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6 }}><Edit3 size={16} /></button>
                              <button onClick={() => { if(confirm("Remove from whitelist?")) removeAllowedUser(u.email); }} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 6 }}><XCircle size={16} /></button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Member Form */}
                    {addingMemberToTeam === team.id ? (
                      <div style={{ padding: 16, border: "1px dashed var(--brand)", borderRadius: 12, background: "var(--brand-glow)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <input value={newMemberForm.fullName} onChange={e => setNewMemberForm(f => ({...f, fullName: e.target.value}))} placeholder="Full Name" style={inputSt} />
                          <input value={newMemberForm.email} onChange={e => setNewMemberForm(f => ({...f, email: e.target.value}))} placeholder="Email (@mbcet.ac.in)" style={inputSt} />
                          <select value={newMemberForm.role} onChange={e => setNewMemberForm(f => ({...f, role: e.target.value as UserRole}))} style={selectSt}>
                            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <input value={newMemberForm.designation} onChange={e => setNewMemberForm(f => ({...f, designation: e.target.value}))} placeholder="Designation" style={inputSt} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={async () => {
                            if(!newMemberForm.email || !newMemberForm.fullName || !newMemberForm.designation) return;
                            await addAllowedUser({
                              email: newMemberForm.email.toLowerCase().trim(),
                              role: newMemberForm.role,
                              designation: newMemberForm.designation,
                              fullName: newMemberForm.fullName,
                              teamId: team.id,
                              isActive: true,
                              addedBy: user?.id ?? "admin"
                            });
                            setAddingMemberToTeam(null);
                            setNewMemberForm({ email: "", fullName: "", role: UserRole.generalMember, designation: "", branchBatch: "", department: "" });
                          }} style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>Add Member</button>
                          <button onClick={() => setAddingMemberToTeam(null)} style={{ background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingMemberToTeam(team.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--brand)", background: "var(--brand-glow)", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>
                        <PlusCircle size={16} /> Add Member to Team
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ACCESS CONTROL TAB                                            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "access" && (
          <>
            {/* Header */}
            <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={24} color="var(--brand)" /> Access Control
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
                  Manage who can log in and what role they get.
                </p>
              </div>
              <button
                onClick={() => { setShowAddForm(!showAddForm); setAddError(""); setAddForm(emptyForm); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, var(--brand), #4338CA)",
                  color: "white", border: "none", borderRadius: 14, padding: "12px 20px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 6px 16px var(--brand-glow)",
                }}
              >
                <PlusCircle size={16} /> Add Member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div className="glass-panel fade-up" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--brand-glow)", background: "var(--bg)" }}>
                <h3 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--text-primary)" }}>Provision New Account</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelSt}>Email Address</label>
                    <input
                      type="email"
                      placeholder="member@mbcet.ac.in"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      style={inputSt}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelSt}>Role</label>
                      <select
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                        style={selectSt}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Tech Head"
                        value={addForm.designation}
                        onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                        style={inputSt}
                      />
                    </div>
                  </div>
                  {addError && (
                    <div style={{ color: "#DC2626", fontSize: 14, background: "rgba(239,68,68,0.1)", borderRadius: 10, padding: "10px 14px", fontWeight: 500 }}>
                      {addError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <button onClick={handleAddUser} disabled={addLoading} style={{
                      flex: 1, background: "var(--brand)", border: "none",
                      borderRadius: 12, padding: 14, color: "white", fontSize: 14, fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: addLoading ? 0.6 : 1, boxShadow: "0 4px 12px var(--brand-glow)"
                    }}>
                      <Save size={16} /> {addLoading ? "Adding…" : "Add to Whitelist"}
                    </button>
                    <button onClick={() => setShowAddForm(false)} style={{
                      padding: "14px 20px", background: "white", border: "1.5px solid var(--border-strong)",
                      borderRadius: 12, color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Whitelist Table */}
            {adminLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading whitelist…</div>
            ) : allowedUsers.length === 0 ? (
              <div className="glass-panel fade-up" style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>
                <ShieldCheck size={48} style={{ margin: "0 auto 16px", color: "var(--border-strong)" }} strokeWidth={1.5} />
                <p style={{ fontSize: 16, fontWeight: 500 }}>No users provisioned yet. Add a member above.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allowedUsers.map((u) => {
                  const isEditing = editEmail === u.email;
                  const config = getRoleConfig(u.role);
                  const isSelf = u.email === user?.email?.toLowerCase();
                  return (
                    <div key={u.email} className="glass-panel fade-up" style={{
                      padding: "20px 24px",
                      opacity: u.isActive ? 1 : 0.6,
                      border: isSelf ? "1.5px solid var(--brand)" : undefined,
                    }}>
                      {isEditing ? (
                        /* ── Edit Row ── */
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{u.email}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })} style={selectSt}>
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <input type="text" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                              placeholder="Designation" style={inputSt} />
                          </div>
                          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                            <button onClick={saveEdit} style={{ display: "flex", alignItems: "center", gap: 6, background: "#10B981", border: "none", borderRadius: 10, padding: "10px 18px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(16,185,129,0.2)" }}>
                              <Save size={14} /> Save
                            </button>
                            <button onClick={() => setEditEmail(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 10, padding: "10px 18px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Display Row ── */
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{u.email}</span>
                              {isSelf && <span style={{ fontSize: 10, fontWeight: 800, background: "var(--brand-glow)", color: "var(--brand)", borderRadius: 8, padding: "2px 8px", textTransform: "uppercase" }}>YOU</span>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: config.bg, color: config.color }}>
                                {config.label}
                              </span>
                              <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{u.designation}</span>
                            </div>
                          </div>
                          {/* Action buttons */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            {/* Toggle active */}
                            <button
                              onClick={() => !isSelf && toggleActive(u.email, u.isActive)}
                              title={u.isActive ? "Disable access" : "Enable access"}
                              style={{ background: "none", border: "none", cursor: isSelf ? "not-allowed" : "pointer", padding: 6, opacity: isSelf ? 0.3 : 1 }}
                            >
                              {u.isActive
                                ? <ToggleRight size={28} color="#10B981" />
                                : <ToggleLeft size={28} color="var(--text-muted)" />
                              }
                            </button>
                            {/* Edit */}
                            <button onClick={() => startEdit(u)}
                              style={{ background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 10, padding: 8, color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}>
                              <Edit3 size={16} />
                            </button>
                            {/* Remove */}
                            {!isSelf && (
                              <button onClick={() => removeAllowedUser(u.email)}
                                style={{ background: "rgba(239,68,68,0.05)", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: 8, color: "#EF4444", cursor: "pointer", transition: "all 0.2s" }}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const labelSt: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block",
};
