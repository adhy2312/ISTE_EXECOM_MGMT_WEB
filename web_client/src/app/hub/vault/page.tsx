"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, Folder, Link as LinkIcon, Download, FileText, Search, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const mockResources = [
  { id: 1, name: "ISTE Logo Kit", type: "folder", category: "assets", items: 12 },
  { id: 2, name: "Sponsorship Deck 2026", type: "pdf", category: "documents", size: "2.4 MB" },
  { id: 3, name: "Official Letterhead", type: "doc", category: "documents", size: "840 KB" },
  { id: 4, name: "ExeCom Drive", type: "link", category: "links", url: "https://drive.google.com" },
  { id: 5, name: "SOP: Event Approval", type: "sop", category: "sops", size: "1.2 MB", description: "Standard operating procedure for getting an event approved." },
  { id: 6, name: "SOP: Social Media Post", type: "sop", category: "sops", size: "900 KB", description: "Guidelines for Instagram and LinkedIn posts." },
];

export default function VaultPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const filteredResources = mockResources.filter(res => res.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const folders = filteredResources.filter(r => r.type === 'folder' || r.type === 'link');
  const documents = filteredResources.filter(r => r.type === 'pdf' || r.type === 'doc');
  const sops = filteredResources.filter(r => r.type === 'sop');

  const renderResourceCard = (res: typeof mockResources[0]) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      key={res.id} 
      className="glass-panel" 
      style={{ 
        padding: "20px", border: "1px solid var(--border)", 
        display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", 
        alignItems: viewMode === "grid" ? "flex-start" : "center", 
        justifyContent: "space-between", gap: 16,
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: viewMode === "grid" ? "flex-start" : "center", gap: 16, width: viewMode === "grid" ? "100%" : "auto" }}>
        <div style={{ 
          width: 48, height: 48, borderRadius: 12, background: "var(--bg-muted)", 
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
        }}>
          {res.type === 'folder' && <Folder color="var(--brand)" size={24} />}
          {res.type === 'link' && <LinkIcon color="#059669" size={24} />}
          {(res.type === 'pdf' || res.type === 'doc') && <FileText color="#D97706" size={24} />}
          {res.type === 'sop' && <FileText color="#7C3AED" size={24} />}
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{res.name}</h3>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginTop: 4 }}>
            {res.type === 'folder' ? `${res.items} items` : res.size || "External Link"}
          </p>
          {viewMode === "grid" && res.description && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>{res.description}</p>
          )}
        </div>
      </div>
      
      <button style={{ 
        background: viewMode === "grid" ? "var(--bg-elevated)" : "transparent", 
        border: viewMode === "grid" ? "1px solid var(--border)" : "none", 
        color: "var(--text-secondary)", cursor: "pointer", 
        padding: viewMode === "grid" ? "10px" : "8px", 
        borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        width: viewMode === "grid" ? "100%" : "auto", transition: "all 0.2s"
      }}>
        {res.type === 'link' ? <LinkIcon size={18} /> : <Download size={18} />}
        {viewMode === "grid" && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700 }}>Open</span>}
      </button>
    </motion.div>
  );

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px 20px", maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/hub" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", textDecoration: "none", background: "var(--bg-elevated)", padding: 12, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="outfit-font" style={{ fontSize: "32px", color: "var(--text-primary)", fontWeight: "800" }}>
              Resource Vault
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "4px", fontWeight: 500 }}>
              SOPs, Brand Assets & Shared Files
            </p>
          </div>
        </div>
        <button className="glass-panel" style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #7C3AED, #5B21B6)", color: "white",
          border: "none", borderRadius: 16, padding: "12px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)",
          transition: "transform 0.2s"
        }}>
          <Plus size={18} /> Upload File
        </button>
      </header>

      {/* Toolbar */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: 400 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 16, 
              border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.6)",
              fontSize: 15, fontWeight: 600, color: "var(--text-primary)", outline: "none"
            }} 
          />
        </div>
        <div style={{ display: "flex", gap: 8, background: "var(--bg-elevated)", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
          <button onClick={() => setViewMode("grid")} style={{ padding: 8, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "grid" ? "var(--bg-muted)" : "transparent", color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode("list")} style={{ padding: 8, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "list" ? "var(--bg-muted)" : "transparent", color: viewMode === "list" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
            <List size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {filteredResources.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: 15, fontWeight: 500 }}
          >
            No files found for &quot;{searchQuery}&quot;.
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {sops.length > 0 && (
          <section className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 24, background: "#7C3AED", borderRadius: 4 }} />
              SOP Library
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence>{sops.map(renderResourceCard)}</AnimatePresence>
            </div>
          </section>
        )}

        {folders.length > 0 && (
          <section className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 24, background: "var(--brand)", borderRadius: 4 }} />
              Folders & Drives
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence>{folders.map(renderResourceCard)}</AnimatePresence>
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 24, background: "#D97706", borderRadius: 4 }} />
              Documents
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence>{documents.map(renderResourceCard)}</AnimatePresence>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
