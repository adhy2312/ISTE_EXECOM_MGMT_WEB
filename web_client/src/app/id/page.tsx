"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import gsap from "gsap";
import { Grid, Share2, Verified } from "lucide-react";
import QRCode from "react-qr-code";

export default function IDPage() {
  const { user } = useAuthStore();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { rotationY: 90, opacity: 0, scale: 0.8 },
        { rotationY: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" }
      );
    }
  }, []);

  if (!user) return <div style={{ textAlign: "center", marginTop: "50px", color: "var(--text-secondary)" }}>No Active User</div>;

  const qrData = JSON.stringify({ uid: user.id, role: user.role, chapter: "ISTE_MBCET" });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ISTE MBCET ExeCom Digital ID',
          text: `Digital ID for ${user.fullName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div style={{ paddingBottom: "100px", perspective: "1000px", padding: "20px 20px 100px", maxWidth: 500, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="outfit-font" style={{ fontSize: "28px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", fontWeight: "800" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Grid color="var(--brand)" size={20} strokeWidth={2.5} />
          </div>
          Digital ID
        </h1>
        <button 
          onClick={handleShare}
          style={{ 
            background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", 
            cursor: "pointer", padding: "10px", borderRadius: "12px", boxShadow: "var(--shadow-sm)"
          }}
        >
          <Share2 size={18} />
        </button>
      </header>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div 
          ref={cardRef} 
          className="glass-panel"
          style={{ 
            width: "100%", maxWidth: "350px", overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 0 20px var(--brand-glow)",
            border: "2px solid var(--brand-glow)",
            background: "white"
          }}
        >
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg, var(--brand), #4338CA)", padding: "24px 20px", 
            textAlign: "center", position: "relative"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.1 }} />
            <h2 className="outfit-font" style={{ color: "white", letterSpacing: "2px", fontSize: "22px", fontWeight: "800", position: "relative", zIndex: 1 }}>
              ISTE SC MBCET
            </h2>
          </div>

          {/* Body */}
          <div style={{ padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ 
              backgroundColor: "white", padding: "16px", borderRadius: "16px",
              marginBottom: "32px", border: "1px solid var(--border-strong)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
            }}>
              <QRCode value={qrData} size={180} fgColor="#1E293B" />
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", textAlign: "center", color: "var(--text-primary)" }}>
              {user.fullName}
            </h2>
            
            <div style={{ 
              backgroundColor: "var(--brand-glow)", border: "1px solid rgba(79, 70, 229, 0.2)",
              color: "var(--brand)", padding: "6px 16px", borderRadius: "20px",
              fontWeight: "800", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px",
              marginBottom: "16px"
            }}>
              {user.designation}
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px", fontWeight: "600" }}>
              {user.branchBatch}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "8px 16px", borderRadius: "12px" }}>
              <Verified size={20} />
              <span style={{ fontWeight: "800", fontSize: "14px" }}>
                VALID: {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
