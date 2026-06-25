"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, Folder, Link as LinkIcon, Download, FileText } from "lucide-react";
import Link from "next/link";

const mockResources = [
  { id: 1, name: "ISTE Logo Kit", type: "folder", items: 12 },
  { id: 2, name: "Sponsorship Deck 2026", type: "pdf", size: "2.4 MB" },
  { id: 3, name: "Official Letterhead", type: "doc", size: "840 KB" },
  { id: 4, name: "ExeCom Drive", type: "link", url: "https://drive.google.com" },
];

export default function VaultPage() {
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
    <div ref={containerRef} style={{ paddingBottom: 100, padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 8, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <ChevronLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 className="outfit-font" style={{ fontSize: "24px", color: "var(--text-primary)", fontWeight: "800" }}>
            Resource Vault
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", fontWeight: 500 }}>
            Shared files & important links
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #7C3AED, #5B21B6)", color: "white",
          border: "none", borderRadius: 12, padding: "10px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)"
        }}>
          <Plus size={16} /> Upload
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {mockResources.map((res) => (
          <div key={res.id} className="glass-panel fade-up" style={{ padding: "16px 20px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {res.type === 'folder' && <Folder color="var(--brand)" size={20} />}
                {res.type === 'link' && <LinkIcon color="#059669" size={20} />}
                {(res.type === 'pdf' || res.type === 'doc') && <FileText color="#D97706" size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{res.name}</h3>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginTop: 2 }}>
                  {res.type === 'folder' ? `${res.items} items` : res.size || "External Link"}
                </p>
              </div>
            </div>
            
            <button style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 8 }}>
              {res.type === 'link' ? <LinkIcon size={18} /> : <Download size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
