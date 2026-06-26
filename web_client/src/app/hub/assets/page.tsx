"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, Box, ShieldCheck, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useHubStore } from "@/store/hub";
import { useAuthStore } from "@/store/auth";

const mockAssets = [
  { id: "1", name: "Arduino Uno R3 Kit", category: "Electronics", quantity: 5, status: "available" },
  { id: "2", name: "ISTE Main Banner (6x4)", category: "Marketing", quantity: 1, status: "in-use" },
  { id: "3", name: "Soldering Station", category: "Hardware", quantity: 2, status: "maintenance" },
];

export default function AssetsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { requestAsset } = useHubStore();
  
  const [requestModal, setRequestModal] = useState<string | null>(null); // asset ID
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestModal) return;
    setSubmitting(true);
    try {
      const asset = mockAssets.find(a => a.id === requestModal);
      if (!asset) return;
      
      await requestAsset({
        assetName: asset.name,
        requesterId: user.id,
        requesterEmail: user.email,
        reason,
        status: "pending"
      });
      setRequestModal(null);
      setReason("");
      alert("Asset request submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px 20px", maxWidth: 700, margin: "0 auto", minHeight: "100vh" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 8, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <ChevronLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 className="outfit-font" style={{ fontSize: "24px", color: "var(--text-primary)", fontWeight: "800" }}>
            Asset Tracker
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", fontWeight: 500 }}>
            Manage physical resources
          </p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mockAssets.map((asset) => (
          <div key={asset.id} className="glass-panel fade-up" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99, 102, 241, 0.1)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{asset.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: asset.status === 'available' ? '#10B981' : asset.status === 'in-use' ? '#F59E0B' : '#EF4444', background: asset.status === 'available' ? 'rgba(16,185,129,0.1)' : asset.status === 'in-use' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', fontSize: 10 }}>
                    {asset.status}
                  </span>
                  • {asset.category} • Qty: {asset.quantity}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setRequestModal(asset.id)}
              disabled={asset.status !== 'available'}
              style={{ background: asset.status === 'available' ? "linear-gradient(135deg, var(--brand), #4338CA)" : "var(--bg-muted)", color: asset.status === 'available' ? "white" : "var(--text-muted)", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: asset.status === 'available' ? "pointer" : "not-allowed" }}
            >
              Request
            </button>
          </div>
        ))}
      </div>

      {requestModal && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setRequestModal(null)}>
          <div className="glass-panel" style={{ width: 400, padding: 24, background: "white" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800 }}>Request Asset</h2>
              <button onClick={() => setRequestModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRequest} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Reason for request</label>
                <textarea required value={reason} onChange={e => setReason(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14, minHeight: 80 }} placeholder="e.g. Needed for AI Workshop on Friday..." />
              </div>
              
              <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 14, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
