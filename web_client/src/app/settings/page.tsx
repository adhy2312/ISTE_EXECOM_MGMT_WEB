"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useMembersStore } from "@/store/members";
import { useAdminStore } from "@/store/admin";
import { useEvaluationStore } from "@/store/evaluation";
import {
  Settings, Users, ShieldCheck, BarChart2, FileText,
  Crown, PlusCircle, Save, X, Edit3, Trash2,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, ExternalLink,
  LogOut, AlertTriangle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole, ExecomMember, ContributionEntry } from "@/types/models";
import { hasPermission, Permission, isRootOrChapterAdmin } from "@/utils/permissions";

type Tab = "builder" | "privileges" | "evaluation" | "access" | "audit";

import { AddMemberModal } from "@/components/AddMemberModal";
import { ROLE_OPTIONS, DESIGNATION_OPTIONS } from "@/lib/constants";

const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";

const getRoleConfig = (role: UserRole) => ROLE_OPTIONS.find(r => r.value === role) ?? ROLE_OPTIONS[6];

const SCORE_COMPONENTS = [
  { key: "departmentScore" as const, label: "Department", max: 6, color: "var(--brand)", shortLabel: "Dept" },
  { key: "initiativeScore" as const, label: "Initiative", max: 2, color: "var(--accent)", shortLabel: "Init" },
  { key: "reliabilityScore" as const, label: "Reliability", max: 1, color: "var(--success)", shortLabel: "Rely" },
  { key: "attendanceScore" as const, label: "Attendance", max: 1, color: "var(--warning)", shortLabel: "Att" },
];

const emptyWhitelistForm = { email: "", role: UserRole.generalMember, designation: "" };

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { members, teams, fetchMembers, fetchTeams, updateMemberProfile } = useMembersStore();
  const { allowedUsers, auditLogs, isLoading: adminLoading, subscribeToAllowedUsers, fetchAuditLogs, addAllowedUser, updateAllowedUser, removeAllowedUser } = useAdminStore();
  const { allEvaluations, allContributions, fetchAllEvaluations, fetchMemberContributions, updateEvaluation, updateContributionStatus } = useEvaluationStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("builder");

  // Builder state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExecomMember>>({});
  const [addingMemberToTeam, setAddingMemberToTeam] = useState<string | null>(null);
  const [newMemberForm, setNewMemberForm] = useState({ email: "", fullName: "", role: UserRole.generalMember, designation: "", branchBatch: "", department: "" });

  // Whitelist/Access state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyWhitelistForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editWhitelistEmail, setEditWhitelistEmail] = useState<string | null>(null);
  const [editWhitelistForm, setEditWhitelistForm] = useState<{ role: UserRole; designation: string }>({ role: UserRole.generalMember, designation: "" });

  // Evaluation state
  const [expandedMemberEval, setExpandedMemberEval] = useState<string | null>(null);
  const [evalDraft, setEvalDraft] = useState<Record<string, number>>({});
  const [expandedContribs, setExpandedContribs] = useState<string | null>(null);

  const isAdmin = isRootOrChapterAdmin(user);

  useEffect(() => {
    if (!isAdmin) { router.replace("/"); return; }
    fetchMembers();
    fetchTeams();
    fetchAllEvaluations();
    const unsub = subscribeToAllowedUsers();
    return () => unsub();
  }, [isAdmin, router, fetchMembers, fetchTeams, fetchAllEvaluations, subscribeToAllowedUsers]);

  useEffect(() => {
    if (activeTab === "audit") fetchAuditLogs();
  }, [activeTab, fetchAuditLogs]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [activeTab]);

  const handleLogout = async () => { await logout(); router.replace("/login"); };

  // ── Privilege handlers ──
  const handleRoleChange = async (m: ExecomMember, newRole: UserRole) => {
    if (m.email === ROOT_ADMIN || m.id === user?.id) { toast.error("Cannot change own role or root admin."); return; }
    try {
      await updateAllowedUser(m.email, { role: newRole });
      await updateMemberProfile(m.id, { role: newRole });
      toast.success(`${m.fullName}'s role updated to ${getRoleConfig(newRole).label}!`);
    } catch { toast.error("Failed to update role."); }
  };

  // ── Evaluation handlers ──
  const openEvalEditor = (memberId: string) => {
    const existing = allEvaluations[memberId];
    setExpandedMemberEval(expandedMemberEval === memberId ? null : memberId);
    setEvalDraft({
      departmentScore: existing?.departmentScore ?? 0,
      initiativeScore: existing?.initiativeScore ?? 0,
      reliabilityScore: existing?.reliabilityScore ?? 0,
      attendanceScore: existing?.attendanceScore ?? 0,
      eventAllocations: existing?.eventAllocations ?? [],
    });
  };
  const saveEval = async (memberId: string) => {
    if (!user) return;
    try {
      await updateEvaluation(memberId, {
        departmentScore: evalDraft.departmentScore ?? 0,
        initiativeScore: evalDraft.initiativeScore ?? 0,
        reliabilityScore: evalDraft.reliabilityScore ?? 0,
        attendanceScore: evalDraft.attendanceScore ?? 0,
        eventAllocations: evalDraft.eventAllocations ?? [],
      }, user.id);
      toast.success("Evaluation scores saved!");
      setExpandedMemberEval(null);
    } catch { toast.error("Failed to save evaluation."); }
  };
  const handleViewContribs = (memberId: string) => {
    if (expandedContribs === memberId) { setExpandedContribs(null); return; }
    setExpandedContribs(memberId);
    fetchMemberContributions(memberId);
  };

  // ── Access whitelist handlers ──
  const handleAddWhitelist = async () => {
    setAddError("");
    if (!addForm.email.endsWith("@mbcet.ac.in")) { setAddError("Email must be an @mbcet.ac.in address."); return; }
    if (!addForm.designation.trim()) { setAddError("Please enter a designation."); return; }
    setAddLoading(true);
    try {
      await addAllowedUser({ email: addForm.email.toLowerCase().trim(), role: addForm.role, designation: addForm.designation.trim(), isActive: true, addedBy: user?.id ?? "admin" });
      setAddForm(emptyWhitelistForm);
      setShowAddForm(false);
      toast.success("Member provisioned!");
    } catch (e) { setAddError((e as Error).message); }
    finally { setAddLoading(false); }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "builder", label: "ExeCom Builder", icon: Users },
    { id: "privileges", label: "Privileges", icon: ShieldCheck },
    { id: "evaluation", label: "Evaluations", icon: BarChart2 },
    { id: "access", label: "Whitelist", icon: Crown },
    { id: "audit", label: "Audit Log", icon: FileText },
  ];

  const inputSt: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  };
  const selectSt: React.CSSProperties = { ...inputSt };

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── Sticky Top Bar ───────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", borderBottom: "1px solid rgba(0,0,0,0.04)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #4338CA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
            <Settings size={18} color="white" />
          </div>
          <div>
            <h1 className="outfit-font text-gradient" style={{ fontSize: 18, fontWeight: 800 }}>God Mode</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Admin Settings · {user?.designation}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "8px 14px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <LogOut size={14} /> Out
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 6, borderBottom: "1px solid var(--border)", overflowX: "auto", flexShrink: 0 }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
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

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <div ref={containerRef} style={{ padding: "24px 20px 100px 20px", maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* ════════════════════ BUILDER TAB ════════════════════ */}
        {activeTab === "builder" && (
          <>
            <div className="fade-up mobile-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: 16 }}>
              <div>
                <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>ExeCom Structure Builder</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Manage member profiles and organizational structure.</p>
              </div>
            </div>



            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {teams.map(team => {
                // Find allowed users that belong to this team
                const teamUsers = allowedUsers.filter(u => u.teamId === team.id);
                // The actual profile from members if they have logged in
                const teamMembers = members.filter(m => m.teamId === team.id);

                return (
                  <div key={team.id} className="glass-panel fade-up" style={{ padding: 24, background: "rgba(255,255,255,0.7)" }}>
                    <div className="mobile-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16, gap: 12 }}>
                      <div>
                        <h3 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{team.name}</h3>
                        {team.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{team.description}</p>}
                      </div>
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
                                <div className="mobile-col" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                                  <span style={{ fontSize: 14, fontWeight: 700 }}>Editing: {u.fullName || u.email}</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                  <div>
                                    <label style={lSt}>Designation</label>
                                    <select value={editForm.designation ?? ""} onChange={e => setEditForm(f => ({ ...f, designation: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", fontSize: 14, outline: "none", background: "white", color: "var(--text-primary)", transition: "border-color 0.2s" }}>
                                      {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                  <button onClick={async () => {
                                    if(profile) {
                                      await updateMemberProfile(profile.id, editForm);
                                    }
                                    await updateAllowedUser(u.email, { designation: editForm.designation, fullName: editForm.fullName });
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
                                setEditForm({ fullName: profile?.fullName ?? u.fullName, designation: profile?.designation ?? u.designation });
                              }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6 }}><Edit3 size={16} /></button>
                              <button onClick={() => { if(confirm("Remove member?")) removeAllowedUser(u.email); }} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 6 }}><Trash2 size={16} /></button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Member Form */}
                    {addingMemberToTeam === team.id ? (
                      <AddMemberModal teamId={team.id} onClose={() => setAddingMemberToTeam(null)} />
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

        {/* ════════════════════ PRIVILEGES TAB ════════════════════ */}
        {activeTab === "privileges" && (
          <>
            <div className="fade-up" style={{ marginBottom: "1.5rem" }}>
              <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>Privilege Control</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Promote or demote members. Changes take effect on next login.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {members.map(m => {
                const rc = getRoleConfig(m.role);
                const isSelf = m.id === user?.id || m.email === ROOT_ADMIN;
                return (
                  <div key={m.id} className="glass-panel fade-up" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, opacity: isSelf ? 0.7 : 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: rc.bg, border: `2px solid ${rc.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: rc.color, flexShrink: 0 }}>
                      {m.fullName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{m.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{m.email}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {isSelf ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: rc.bg, color: rc.color }}>{rc.label}</span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={e => handleRoleChange(m, e.target.value as UserRole)}
                          style={{ ...selectSt, width: "auto", padding: "8px 12px", fontSize: 13, fontWeight: 700, color: rc.color, background: rc.bg, border: `1px solid ${rc.color}40` }}
                        >
                          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Warning note */}
            <div className="fade-up" style={{ marginTop: 20, padding: "14px 18px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: "#92400E", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                Role changes are applied immediately to the whitelist. The member will see their updated role on their next login or page refresh.
              </p>
            </div>
          </>
        )}

        {/* ════════════════════ EVALUATION TAB ════════════════════ */}
        {activeTab === "evaluation" && (
          <>
            <div className="fade-up mobile-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: 12 }}>
              <div>
                <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>Evaluation Manager</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Set performance scores and verify contribution log entries.</p>
              </div>
              <button onClick={() => { fetchAllEvaluations(); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--brand-glow)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "10px 14px", color: "var(--brand)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {members.map(m => {
                const evalData = allEvaluations[m.id];
                const isExpanded = expandedMemberEval === m.id;
                const contribsExpanded = expandedContribs === m.id;
                const contribs = allContributions[m.id] ?? [];
                const pendingCount = contribs.filter(c => c.status === "pending").length;
                
                const eventPoints = (evalDraft.eventAllocations || []).reduce((sum, ev) => sum + ev.points, 0);
                const totalScore = (evalDraft.departmentScore ?? 0) + (evalDraft.initiativeScore ?? 0) + (evalDraft.reliabilityScore ?? 0) + (evalDraft.attendanceScore ?? 0) + eventPoints;

                return (
                  <div key={m.id} className="glass-panel fade-up" style={{ padding: "20px 24px" }}>
                    {/* Member header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isExpanded || contribsExpanded ? 16 : 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand), #4338CA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", flexShrink: 0 }}>
                        {m.fullName.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{m.fullName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{m.designation} · Dept No: {m.department || "N/A"}</div>
                      </div>
                      <div style={{ textAlign: "right", marginRight: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--brand)" }}>{evalData?.totalScore ?? "–"}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>/10</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleViewContribs(m.id)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: pendingCount > 0 ? "rgba(245,158,11,0.1)" : "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", color: pendingCount > 0 ? "#D97706" : "var(--text-secondary)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          <Clock size={13} /> {pendingCount > 0 ? `${pendingCount} pending` : "Contribs"}
                        </button>
                        <button
                          onClick={() => openEvalEditor(m.id)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: isExpanded ? "var(--brand)" : "var(--brand-light)", border: "none", borderRadius: 10, padding: "8px 12px", color: isExpanded ? "white" : "var(--brand)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          <Edit3 size={13} /> Score
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Score editor */}
                    {isExpanded && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Adjust Scores</span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--brand)" }}>
                            Total: {isExpanded ? totalScore : evalData?.totalScore ?? 0}/10
                          </span>
                        </div>
                        {SCORE_COMPONENTS.map(sc => (
                          <div key={sc.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{sc.label}</label>
                              <span style={{ fontSize: 14, fontWeight: 800, color: sc.color }}>{evalDraft[sc.key] ?? 0}/{sc.max}</span>
                            </div>
                            <input
                              type="range" min={0} max={sc.max} step={sc.max === 1 ? 0.1 : 0.5}
                              value={evalDraft[sc.key] ?? 0}
                              onChange={e => setEvalDraft(d => ({ ...d, [sc.key]: Number(e.target.value) }))}
                              style={{ width: "100%", accentColor: sc.color, cursor: "pointer" }}
                            />
                          </div>
                        ))}
                        
                        {/* Event Points Section */}
                        <div style={{ marginTop: 24, padding: 16, background: "var(--bg-muted)", borderRadius: 12, border: "1px solid var(--border)" }}>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Activity size={14} color="var(--brand)" /> Event Allocations</h4>
                          {(evalDraft.eventAllocations || []).map((ev, idx) => (
                            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <input type="text" value={ev.eventName} onChange={e => {
                                const newAllocs = [...(evalDraft.eventAllocations || [])];
                                newAllocs[idx].eventName = e.target.value;
                                setEvalDraft({ ...evalDraft, eventAllocations: newAllocs });
                              }} placeholder="Event Name" style={{ flex: 1, ...inputSt, padding: "8px 12px" }} />
                              <input type="number" value={ev.points} onChange={e => {
                                const newAllocs = [...(evalDraft.eventAllocations || [])];
                                newAllocs[idx].points = Number(e.target.value);
                                setEvalDraft({ ...evalDraft, eventAllocations: newAllocs });
                              }} placeholder="Pts" style={{ width: 70, ...inputSt, padding: "8px 12px" }} />
                              <button onClick={() => {
                                const newAllocs = [...(evalDraft.eventAllocations || [])];
                                newAllocs.splice(idx, 1);
                                setEvalDraft({ ...evalDraft, eventAllocations: newAllocs });
                              }} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 8 }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => {
                            setEvalDraft({
                              ...evalDraft,
                              eventAllocations: [...(evalDraft.eventAllocations || []), { id: Date.now().toString(), eventName: "", points: 0, allocatedAt: new Date().toISOString() }]
                            });
                          }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--brand)", background: "var(--brand-glow)", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                            <Plus size={14} /> Add Event Points
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                          <button onClick={() => saveEval(m.id)} style={{ flex: 1, background: "#10B981", border: "none", borderRadius: 12, padding: 13, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
                            <Save size={15} /> Save Scores
                          </button>
                          <button onClick={() => setExpandedMemberEval(null)} style={{ padding: "13px 18px", background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Contribution log review */}
                    {contribsExpanded && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: isExpanded ? 16 : 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Contribution Log Entries</div>
                        {contribs.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>No contributions submitted yet.</div>
                        ) : contribs.map(c => (
                          <div key={c.id} style={{ padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 12, marginBottom: 8, border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.task}</div>
                                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.date}</span>
                                  {c.proofUrl && (
                                    <a href={c.proofUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--brand)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                                      <ExternalLink size={10} /> Proof
                                    </a>
                                  )}
                                </div>
                              </div>
                              {c.status === "pending" ? (
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                  <button onClick={() => updateContributionStatus(m.id, c.id, "verified")} style={{ background: "#10B981", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                    <CheckCircle2 size={11} /> Verify
                                  </button>
                                  <button onClick={() => updateContributionStatus(m.id, c.id, "rejected")} style={{ background: "var(--error-light)", border: "none", borderRadius: 8, padding: "6px 12px", color: "var(--error)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                    <XCircle size={11} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: c.status === "verified" ? "var(--success-light)" : "var(--error-light)", color: c.status === "verified" ? "var(--success)" : "var(--error)" }}>
                                  {c.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ════════════════════ ACCESS WHITELIST TAB ════════════════════ */}
        {activeTab === "access" && (
          <>
            <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={22} color="var(--brand)" /> Access Whitelist
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Control who can log in. Only provisioned @mbcet.ac.in accounts may access.</p>
              </div>
              <button onClick={() => { setShowAddForm(!showAddForm); setAddError(""); setAddForm(emptyWhitelistForm); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 14, padding: "12px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px var(--brand-glow)" }}>
                <PlusCircle size={15} /> Add Member
              </button>
            </div>

            {showAddForm && (
              <AddMemberModal onClose={() => setShowAddForm(false)} />
            )}

            {adminLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>Loading whitelist…</div>
            ) : allowedUsers.length === 0 ? (
              <div className="glass-panel fade-up" style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>
                <ShieldCheck size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontWeight: 500 }}>No users provisioned yet. Add a member above.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allowedUsers.map(u => {
                  const isEditing = editWhitelistEmail === u.email;
                  const rc = getRoleConfig(u.role);
                  const isSelf = u.email === user?.email?.toLowerCase();
                  return (
                    <div key={u.email} className="glass-panel fade-up" style={{ padding: "18px 22px", opacity: u.isActive ? 1 : 0.6, border: isSelf ? "1.5px solid var(--brand)" : undefined }}>
                      {isEditing ? (
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{u.email}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                            <select value={editWhitelistForm.role} onChange={e => setEditWhitelistForm({ ...editWhitelistForm, role: e.target.value as UserRole })} style={selectSt}>
                              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <select value={editWhitelistForm.designation} onChange={e => setEditWhitelistForm({ ...editWhitelistForm, designation: e.target.value })} style={selectSt}>
                              {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={async () => { await updateAllowedUser(u.email, editWhitelistForm); setEditWhitelistEmail(null); toast.success("Updated!"); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#10B981", border: "none", borderRadius: 10, padding: "10px 18px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Save size={14} /> Save</button>
                            <button onClick={() => setEditWhitelistEmail(null)} style={{ background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 10, padding: "10px 18px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{u.email}</span>
                              {isSelf && <span style={{ fontSize: 9, fontWeight: 800, background: "var(--brand-glow)", color: "var(--brand)", borderRadius: 6, padding: "2px 6px", textTransform: "uppercase" }}>YOU</span>}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8, background: rc.bg, color: rc.color }}>{rc.label}</span>
                              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{u.designation}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button onClick={() => !isSelf && updateAllowedUser(u.email, { isActive: !u.isActive })} title={u.isActive ? "Disable" : "Enable"} style={{ background: "none", border: "none", cursor: isSelf ? "not-allowed" : "pointer", padding: 4, opacity: isSelf ? 0.3 : 1 }}>
                              {u.isActive ? <ToggleRight size={26} color="#10B981" /> : <ToggleLeft size={26} color="var(--text-muted)" />}
                            </button>
                            <button onClick={() => { setEditWhitelistEmail(u.email); setEditWhitelistForm({ role: u.role, designation: u.designation }); }} style={{ background: "white", border: "1.5px solid var(--border-strong)", borderRadius: 10, padding: 8, color: "var(--text-secondary)", cursor: "pointer" }}><Edit3 size={15} /></button>
                            {!isSelf && <button onClick={() => removeAllowedUser(u.email)} style={{ background: "var(--error-light)", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: 8, color: "var(--error)", cursor: "pointer" }}><Trash2 size={15} /></button>}
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

        {/* ════════════════════ AUDIT LOG TAB ════════════════════ */}
        {activeTab === "audit" && (
          <>
            <div className="fade-up" style={{ marginBottom: "1.5rem" }}>
              <h2 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>System Audit Log</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Immutable record of all admin actions. Cannot be edited or deleted.</p>
            </div>
            {auditLogs.length === 0 ? (
              <div className="glass-panel fade-up" style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>
                <FileText size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontWeight: 500 }}>No audit logs found.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {auditLogs.map((log, idx) => (
                  <div key={log.id} className="glass-panel fade-up" style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: log.action.includes("APPROVE") ? "var(--success-light)" : log.action.includes("REJECT") ? "var(--error-light)" : "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {log.action.includes("APPROVE") ? <CheckCircle2 size={16} color="var(--success)" /> : log.action.includes("REJECT") ? <XCircle size={16} color="var(--error)" /> : <ShieldCheck size={16} color="var(--brand)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {log.action.replace(/_/g, " ")}
                        {log.awardedPoints != null && <span style={{ color: "var(--success)", marginLeft: 8 }}>+{log.awardedPoints} XP</span>}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Admin: {log.adminId.slice(0, 8)}…</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Target: {log.targetId.slice(0, 8)}…</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>#{idx + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </>
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
