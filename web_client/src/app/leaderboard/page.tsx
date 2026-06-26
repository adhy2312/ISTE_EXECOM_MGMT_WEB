"use client";

import { useEffect, useRef, useState } from "react";
import { useMembersStore } from "@/store/members";
import gsap from "gsap";
import { Trophy, Award, TrendingUp, Zap } from "lucide-react";
import { ExecomMember } from "@/types/models";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const { members, isLoading, fetchMembers } = useMembersStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "top10">("all");

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!isLoading && members.length > 0 && containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".leaderboard-card");
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }
      );
    }
  }, [isLoading, members]);

  if (isLoading) {
    return (
      <div style={{ padding: "20px 20px 100px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center", paddingTop: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-glow)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy color="var(--brand)" size={28} strokeWidth={2.5} />
          </div>
          <div style={{ height: 32, background: "var(--bg-muted)", borderRadius: 8, width: 200, margin: "0 auto 8px" }} />
          <div style={{ height: 16, background: "var(--bg-muted)", borderRadius: 6, width: 280, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: "3rem", height: 220 }}>
          {[100, 80, 70].map((h, i) => (
            <div key={i} style={{ width: "30%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: h + 8, height: h + 8, borderRadius: "50%", background: "var(--bg-muted)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 16, background: "var(--bg-muted)", borderRadius: 6, width: "80%" }} />
              <div style={{ height: 12, background: "var(--bg-muted)", borderRadius: 4, width: "50%" }} />
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-panel" style={{ height: 72, marginBottom: 12, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  // Sort members by points descending
  const sortedMembers = [...members].sort((a, b) => b.corePoints - a.corePoints);
  const podium = sortedMembers.slice(0, 3);
  const rest = filter === "top10" ? sortedMembers.slice(3, 10) : sortedMembers.slice(3);
  const maxXP = sortedMembers[0]?.corePoints ?? 1;

  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: "linear-gradient(135deg, #F59E0B, #D97706)", border: "#FBBF24", text: "#B45309", glow: "rgba(245, 158, 11, 0.3)" };
    if (rank === 2) return { bg: "linear-gradient(135deg, #94A3B8, #64748B)", border: "#CBD5E1", text: "#475569", glow: "rgba(148, 163, 184, 0.3)" };
    return { bg: "linear-gradient(135deg, #D97706, #92400E)", border: "#F59E0B", text: "#78350F", glow: "rgba(217, 119, 6, 0.3)" };
  };

  return (
    <div ref={containerRef} style={{ paddingBottom: 100, padding: "20px 20px 100px", maxWidth: 600, margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem", textAlign: "center", paddingTop: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--brand-glow)", marginBottom: 16, boxShadow: "0 8px 24px var(--brand-glow)" }}>
          <Trophy color="var(--brand)" size={28} strokeWidth={2.5} />
        </div>
        <h1 className="outfit-font" style={{ fontSize: "32px", color: "var(--text-primary)", fontWeight: "800" }}>
          Live Velocity
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "6px", fontWeight: 500 }}>
          Top performers driving the chapter forward
        </p>
      </header>

      {/* Podium */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: "3rem", height: 240 }}>
        {podium[1] && <PodiumMember member={podium[1]} rank={2} color={getRankColor(2)} />}
        {podium[0] && <PodiumMember member={podium[0]} rank={1} color={getRankColor(1)} />}
        {podium[2] && <PodiumMember member={podium[2]} rank={3} color={getRankColor(3)} />}
      </div>

      {/* Filter */}
      {sortedMembers.length > 6 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "var(--bg-elevated)", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
          {(["all", "top10"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: filter === f ? "var(--bg-muted)" : "transparent",
              color: filter === f ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13, fontWeight: 700, transition: "all 0.2s"
            }}>
              {f === "all" ? "All Members" : "Top 10 Only"}
            </button>
          ))}
        </div>
      )}

      {/* Rest of the leaderboard */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <AnimatePresence>
          {rest.map((member, idx) => {
            const xpBarWidth = maxXP > 0 ? (member.corePoints / maxXP) * 100 : 0;
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="leaderboard-card glass-panel"
                style={{ border: "1px solid var(--border)", transition: "transform 0.2s, box-shadow 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    backgroundColor: "var(--bg-muted)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontWeight: "800", color: "var(--text-secondary)", fontSize: "14px", flexShrink: 0,
                  }}>
                    #{idx + 4}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.fullName}</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{member.designation}</p>
                    {/* XP bar */}
                    <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${xpBarWidth}%`, background: "var(--brand)", borderRadius: 2, transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: "800", color: "var(--brand)", fontSize: "18px" }}>
                      {member.corePoints}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>XP</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {rest.length === 0 && sortedMembers.length <= 3 && (
          <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Only {sortedMembers.length} member(s) so far. Keep going!
          </div>
        )}
      </div>

      {/* Chapter total footer */}
      {members.length > 0 && (
        <div className="leaderboard-card glass-panel" style={{ marginTop: 24, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", background: "var(--brand-glow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={20} color="var(--brand)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Chapter Total XP</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{members.length} active members</div>
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--brand)", display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={18} />
            {members.reduce((s, m) => s + m.corePoints, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumMember({ member, rank, color }: { member: ExecomMember, rank: number, color: { bg: string, border: string, text: string, glow: string } }) {
  const size = rank === 1 ? 100 : rank === 2 ? 82 : 72;
  const podiumHeight = rank === 1 ? 80 : rank === 2 ? 56 : 40;

  return (
    <div className="leaderboard-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%", position: "relative" }}>
      {rank === 1 && <Award size={26} color="#F59E0B" style={{ position: "absolute", top: -38, zIndex: 10, filter: "drop-shadow(0 4px 8px rgba(245,158,11,0.5))" }} />}

      {/* Avatar */}
      <div style={{
        width: size + 8, height: size + 8, borderRadius: "50%",
        background: "white", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 12px 32px ${color.glow}`, marginBottom: "12px", position: "relative",
        border: `3px solid ${color.border}`, zIndex: 2, flexShrink: 0,
      }}>
        <div style={{
          width: size - 4, height: size - 4, borderRadius: "50%",
          background: color.bg, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.38, fontWeight: "800", color: "white",
        }}>
          {member.photoURL
            ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={member.photoURL} alt={member.fullName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            )
            : member.fullName.charAt(0)
          }
        </div>
        {/* Rank Badge */}
        <div style={{
          position: "absolute", bottom: -10, background: "white",
          color: color.text, width: "28px", height: "28px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "13px", border: `2px solid ${color.border}`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)", zIndex: 3,
        }}>
          {rank}
        </div>
      </div>

      <h3 style={{ fontSize: rank === 1 ? "15px" : "13px", fontWeight: "800", textAlign: "center", color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
        {member.fullName.split(' ')[0]}
      </h3>
      <p style={{ fontSize: "14px", fontWeight: "800", color: color.text, marginBottom: 12 }}>
        {member.corePoints} <span style={{ fontSize: 10, opacity: 0.7 }}>XP</span>
      </p>

      {/* Podium base */}
      <div style={{ width: "100%", height: podiumHeight, background: color.bg, borderRadius: "10px 10px 0 0", opacity: 0.3 }} />
    </div>
  );
}
