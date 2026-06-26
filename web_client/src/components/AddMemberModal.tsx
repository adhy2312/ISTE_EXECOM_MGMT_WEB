"use client";

import { useState } from "react";
import { UserRole } from "@/types/models";
import { ROLE_OPTIONS, DESIGNATION_OPTIONS } from "@/lib/constants";
import { useMembersStore } from "@/store/members";
import { useAuthStore } from "@/store/auth";
import { X } from "lucide-react";

interface AddMemberModalProps {
  onClose: () => void;
  teamId?: string; // Optional: If provided, assigns the member to this team.
}

export function AddMemberModal({ onClose, teamId }: AddMemberModalProps) {
  const { user } = useAuthStore();
  const { addAllowedUser } = useMembersStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: UserRole.generalMember,
    designation: DESIGNATION_OPTIONS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.fullName || !form.designation) return;
    setSubmitting(true);
    try {
      await addAllowedUser({
        email: form.email.toLowerCase().trim(),
        role: form.role,
        designation: form.designation,
        fullName: form.fullName,
        teamId: teamId,
        isActive: true,
        addedBy: user?.id ?? "admin"
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="glass-panel" style={{ width: 450, padding: 24, background: "white" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
            {teamId ? "Add Member to Team" : "Provision New Member"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Full Name</label>
            <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="e.g. Adhithya Mohan" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Email Address (@mbcet.ac.in)</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@mbcet.ac.in" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Role</label>
              <select required value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})} style={inputStyle}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Designation</label>
              <select required value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} style={inputStyle}>
                {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          
          <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 14, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14, outline: "none", background: "white", color: "var(--text-primary)"
};
