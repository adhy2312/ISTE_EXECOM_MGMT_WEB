"use client";

import { useEffect, useRef } from "react";
import { useMembersStore } from "@/store/members";
import gsap from "gsap";
import { Trophy, TrendingUp, Award } from "lucide-react";

export default function LeaderboardPage() {
  const { members, isLoading, fetchMembers } = useMembersStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!isLoading && members.length > 0 && containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".leaderboard-card");
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.6, stagger: 0.08, ease: "power3.out",
        }
      );
    }
  }, [isLoading, members]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // Sort members by points descending
  const sortedMembers = [...members].sort((a, b) => b.corePoints - a.corePoints);
  const podium = sortedMembers.slice(0, 3);
  const rest = sortedMembers.slice(3);

  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: "linear-gradient(135deg, #F59E0B, #D97706)", border: "#FBBF24", text: "#B45309", glow: "rgba(245, 158, 11, 0.25)" };
    if (rank === 2) return { bg: "linear-gradient(135deg, #94A3B8, #64748B)", border: "#CBD5E1", text: "#475569", glow: "rgba(148, 163, 184, 0.25)" };
    return { bg: "linear-gradient(135deg, #D97706, #92400E)", border: "#F59E0B", text: "#78350F", glow: "rgba(217, 119, 6, 0.25)" };
  };

  return (
    <div ref={containerRef} style={{ paddingBottom: "100px", padding: "20px 20px 100px", maxWidth: 600, margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem", textAlign: "center", paddingTop: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--brand-glow)", marginBottom: 16 }}>
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: "3rem", height: 220 }}>
        {podium[1] && <PodiumMember member={podium[1]} rank={2} color={getRankColor(2)} />}
        {podium[0] && <PodiumMember member={podium[0]} rank={1} color={getRankColor(1)} />}
        {podium[2] && <PodiumMember member={podium[2]} rank={3} color={getRankColor(3)} />}
      </div>

      {/* Rest of the leaderboard */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {rest.map((member, idx) => (
          <div key={member.id} className="leaderboard-card glass-panel" style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "16px", border: "1px solid var(--border)", transition: "transform 0.2s, box-shadow 0.2s" }}>
            <div style={{ 
              width: "36px", height: "36px", borderRadius: "10px", 
              backgroundColor: "var(--bg-muted)", display: "flex", 
              alignItems: "center", justifyContent: "center", 
              fontWeight: "800", color: "var(--text-secondary)", fontSize: "14px",
            }}>
              #{idx + 4}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "2px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.fullName}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{member.designation}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: "800", color: "var(--brand)", fontSize: "18px" }}>
                {member.corePoints}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumMember({ member, rank, color }: { member: any, rank: number, color: any }) {
  const size = rank === 1 ? 100 : rank === 2 ? 80 : 70;
  
  return (
    <div className="leaderboard-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%", position: "relative" }}>
      {rank === 1 && <Award size={24} color="#F59E0B" style={{ position: "absolute", top: -36, zIndex: 10, filter: "drop-shadow(0 4px 6px rgba(245,158,11,0.4))" }} />}
      
      {/* Avatar Container */}
      <div style={{
        width: size + 8, height: size + 8, borderRadius: "50%",
        background: "white", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 12px 24px ${color.glow}`, marginBottom: "16px", position: "relative",
        border: `3px solid ${color.border}`, zIndex: 2
      }}>
        <div style={{
          width: size - 4, height: size - 4, borderRadius: "50%",
          background: color.bg, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.4, fontWeight: "800", color: "white",
        }}>
          {member.fullName.charAt(0)}
        </div>
        
        {/* Rank Badge */}
        <div style={{
          position: "absolute", bottom: -8, background: "white",
          color: color.text, width: "26px", height: "26px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "13px", border: `2px solid ${color.border}`,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          {rank}
        </div>
      </div>
      
      <h3 style={{ fontSize: rank === 1 ? "16px" : "14px", fontWeight: "800", textAlign: "center", color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
        {member.fullName.split(' ')[0]}
      </h3>
      <p style={{ fontSize: "14px", fontWeight: "800", color: color.text }}>
        {member.corePoints} <span style={{ fontSize: 10, opacity: 0.7 }}>XP</span>
      </p>
    </div>
  );
}
