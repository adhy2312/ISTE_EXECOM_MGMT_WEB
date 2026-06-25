"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";
import { Team, UserRole, ExecomMember } from "@/types/models";
import { Users, UserPlus, Shield, Plus, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeamsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<ExecomMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const [activeModal, setActiveModal] = useState<{ type: 'leader' | 'member', teamId: string } | null>(null);

  const isAdmin = user?.role === UserRole.chapterAdmin;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [user, authLoading, router, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        const [teamsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "teams")),
          getDocs(collection(db, "users"))
        ]);
        
        setTeams(teamsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
        setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExecomMember)));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) return;
    try {
      const teamData: Omit<Team, 'id'> = {
        name: newTeam.name,
        description: newTeam.description,
        leaderId: null,
        memberIds: [],
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "teams"), teamData);
      setTeams([...teams, { id: docRef.id, ...teamData }]);
      setIsCreating(false);
      setNewTeam({ name: "", description: "" });
    } catch {
      alert("Failed to create team");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    await deleteDoc(doc(db, "teams", id));
    setTeams(teams.filter(t => t.id !== id));
  };

  const assignUserToTeam = async (userId: string) => {
    if (!activeModal) return;
    const { type, teamId } = activeModal;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      const updates: Partial<Team> = {};
      if (type === 'leader') {
        updates.leaderId = userId;
      } else {
        if (!team.memberIds.includes(userId)) {
          updates.memberIds = [...team.memberIds, userId];
        }
      }

      await updateDoc(doc(db, "teams", teamId), updates);
      
      // Update local state
      setTeams(teams.map(t => t.id === teamId ? { ...t, ...updates } : t));
      setActiveModal(null);
    } catch {
      alert("Failed to assign user");
    }
  };

  const removeMember = async (teamId: string, memberId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const newMembers = team.memberIds.filter(id => id !== memberId);
    await updateDoc(doc(db, "teams", teamId), { memberIds: newMembers });
    setTeams(teams.map(t => t.id === teamId ? { ...t, memberIds: newMembers } : t));
  };

  if (authLoading || loading) return <div className="app-container" style={{ alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  if (!isAdmin) return null;

  const getUserName = (id: string) => allUsers.find(u => u.id === id)?.fullName || "Unknown User";
  const facultyMembers = allUsers.filter(u => u.role === UserRole.facultyAdvisor);

  return (
    <div className="app-container">
      <main className="main-content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <h1 className="outfit-font" style={{ fontSize: "28px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(55, 48, 163, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users color="var(--brand)" size={20} strokeWidth={2.5} />
              </div>
              Execom Structure
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8, fontWeight: 500 }}>Manage teams, leaders, and faculty advisors</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> New Team
          </button>
        </div>

        {/* Faculty Advisors Section */}
        <div className="glass-panel fade-up" style={{ padding: 20, marginBottom: "2rem", borderLeft: "4px solid var(--accent)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Shield size={18} color="var(--accent)" /> Faculty Advisors
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {facultyMembers.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>No faculty advisors assigned yet. Use Cmd+K &gt; Assign Roles to promote a user to Faculty Advisor.</p>
            ) : (
              facultyMembers.map(f => (
                <div key={f.id} style={{ background: "var(--bg-muted)", padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {f.fullName}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Teams Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {teams.map((team) => (
            <div key={team.id} className="glass-panel fade-up" style={{ padding: 20, position: "relative" }}>
              <button 
                onClick={() => handleDeleteTeam(team.id)}
                style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, paddingRight: 30 }}>{team.name}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, minHeight: 40 }}>{team.description || "No description provided."}</p>
              
              {/* Leader */}
              <div style={{ marginBottom: 16, padding: 12, background: "var(--brand-light)", borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Team Lead</div>
                {team.leaderId ? (
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{getUserName(team.leaderId)}</div>
                ) : (
                  <button onClick={() => setActiveModal({ type: 'leader', teamId: team.id })} style={{ background: "none", border: "none", color: "var(--brand)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <UserPlus size={14} /> Assign Lead
                  </button>
                )}
              </div>

              {/* Members */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Members</div>
                  <button onClick={() => setActiveModal({ type: 'member', teamId: team.id })} style={{ background: "none", border: "none", color: "var(--brand)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
                </div>
                {team.memberIds.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No members yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {team.memberIds.map(mid => (
                      <div key={mid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        {getUserName(mid)}
                        <button onClick={() => removeMember(team.id, mid)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Create Team Modal */}
      {isCreating && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsCreating(false)}>
          <div className="glass-panel" style={{ width: 400, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>Team Name</label>
                <input required value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", background: "var(--bg)" }} placeholder="e.g. Design Team" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>Description</label>
                <textarea value={newTeam.description} onChange={e => setNewTeam({ ...newTeam, description: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", background: "var(--bg)", minHeight: 80 }} placeholder="What does this team do?" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsCreating(false)} style={{ background: "none", border: "none", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 16px", minHeight: 0 }}>Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {activeModal && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div className="glass-panel" style={{ width: 400, padding: 24, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              Select {activeModal.type === 'leader' ? "Team Leader" : "Member"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allUsers.map(u => (
                <button 
                  key={u.id}
                  onClick={() => assignUserToTeam(u.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: 12, background: "var(--bg-muted)", border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.fullName}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>{u.role}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} style={{ width: "100%", marginTop: 16, padding: 12, background: "none", border: "1.5px solid var(--border)", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
