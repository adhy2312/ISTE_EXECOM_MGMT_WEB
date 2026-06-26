"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, Box, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

const mockAssets = [
  { id: 1, name: "Arduino Uno R3 Kit", category: "Electronics", quantity: 5, status: "available" },
  { id: 2, name: "ISTE Main Banner (6x4)", category: "Marketing", quantity: 1, status: "in-use" },
  { id: 3, name: "Soldering Station", category: "Hardware", quantity: 2, status: "maintenance" },
];

export default function AssetsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px 20px", maxWidth: 700, margin: "0 auto" }}>
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
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #059669, #047857)", color: "white",
          border: "none", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)"
        }}>
          <Plus size={16} /> Add Item
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {mockAssets.map((asset) => (
          <div key={asset.id} className="glass-panel fade-up" style={{ padding: 20, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(5, 150, 105, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box color="#059669" size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{asset.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{asset.category}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>Qty: {asset.quantity}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center" }}>
              {asset.status === 'available' && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#059669", background: "rgba(5,150,105,0.1)", padding: "4px 10px", borderRadius: 8 }}><ShieldCheck size={14}/> Available</span>}
              {asset.status === 'in-use' && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "var(--brand)", background: "var(--brand-glow)", padding: "4px 10px", borderRadius: 8 }}>In Use</span>}
              {asset.status === 'maintenance' && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#DC2626", background: "rgba(220,38,38,0.1)", padding: "4px 10px", borderRadius: 8 }}><AlertTriangle size={14}/> Maintenance</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
