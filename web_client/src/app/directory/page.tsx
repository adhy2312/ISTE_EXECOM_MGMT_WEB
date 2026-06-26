"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMembersStore } from "@/store/members";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List, Filter, Mail, Phone, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DirectoryPage() {
  const { members, fetchMembers, isLoading } = useMembersStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "All" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const roles = ["All", ...Array.from(new Set(members.map(m => m.role)))];

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "100px", color: "var(--text-secondary)" }}>Please log in.</div>;
  }

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* Header section */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 className="outfit-font" style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginBottom: 8 }}>
            Executive Directory
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: "500" }}>
            Connect with {members.length} active chapter executives
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* View Toggle */}
          <div style={{ display: "flex", background: "var(--bg-elevated)", padding: 4, borderRadius: 12, border: "1px solid var(--border)" }}>
            <button 
              onClick={() => setViewMode("grid")}
              style={{
                padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                background: viewMode === "grid" ? "var(--brand-glow)" : "transparent",
                color: viewMode === "grid" ? "var(--brand)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              style={{
                padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                background: viewMode === "list" ? "var(--brand-glow)" : "transparent",
                color: viewMode === "list" ? "var(--brand)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search by name or designation..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 16,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "15px", fontWeight: 500,
              boxShadow: "var(--shadow-sm)", transition: "all 0.2s"
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: "14px 40px 14px 16px", borderRadius: 16, appearance: "none",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "15px", fontWeight: 600,
              cursor: "pointer", boxShadow: "var(--shadow-sm)"
            }}
          >
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", 
          gap: 20 
        }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={viewMode === "grid" ? 280 : 80} borderRadius={24} />
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          style={{ 
            display: "grid", 
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", 
            gap: 24 
          }}
        >
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={member.id}
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: viewMode === "grid" ? "column" : "row",
                  alignItems: viewMode === "grid" ? "center" : "center",
                  textAlign: viewMode === "grid" ? "center" : "left",
                  gap: 16,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Decorative blob for grid view */}
                {viewMode === "grid" && (
                  <div style={{ position: "absolute", top: -50, right: -50, width: 100, height: 100, background: "var(--brand-glow)", borderRadius: "50%", filter: "blur(40px)" }} />
                )}

                <div style={{
                  width: viewMode === "grid" ? 80 : 60, 
                  height: viewMode === "grid" ? 80 : 60, 
                  borderRadius: "50%",
                  background: member.photoURL ? `url(${member.photoURL}) center/cover` : "linear-gradient(135deg, var(--brand), #4338CA)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: viewMode === "grid" ? 28 : 20, fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  border: "3px solid white"
                }}>
                  {!member.photoURL && member.fullName.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", marginBottom: 4 }}>
                    {member.fullName}
                  </h3>
                  <div style={{ 
                    display: "inline-block", padding: "4px 10px", borderRadius: 12, 
                    background: "var(--brand-glow)", color: "var(--brand)", 
                    fontSize: "12px", fontWeight: "700", textTransform: "uppercase",
                    letterSpacing: "0.5px", marginBottom: 12
                  }}>
                    {member.designation || member.role}
                  </div>
                  
                  {member.department && (
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>
                      {member.department}
                    </p>
                  )}
                  {member.branchBatch && (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginBottom: viewMode === "grid" ? 16 : 0 }}>
                      {member.branchBatch}
                    </p>
                  )}
                </div>

                <div style={{ 
                  display: "flex", 
                  gap: 8, 
                  justifyContent: viewMode === "grid" ? "center" : "flex-end",
                  width: viewMode === "grid" ? "100%" : "auto"
                }}>
                  <a href={`mailto:${member.email}`} style={{ padding: 10, background: "var(--bg-muted)", borderRadius: "50%", color: "var(--text-secondary)", transition: "all 0.2s" }}>
                    <Mail size={18} />
                  </a>
                  {member.contact && (
                    <a href={`tel:${member.contact}`} style={{ padding: 10, background: "var(--bg-muted)", borderRadius: "50%", color: "var(--text-secondary)", transition: "all 0.2s" }}>
                      <Phone size={18} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMembers.length === 0 && !isLoading && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Filter size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-secondary)" }}>No members found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
