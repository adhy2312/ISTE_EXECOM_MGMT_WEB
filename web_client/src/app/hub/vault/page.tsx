"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, Plus, Folder, Link as LinkIcon, Download, FileText, Search, LayoutGrid, List, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHubStore } from "@/store/hub";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function VaultPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { vaultResources, fetchVault, addVaultResource, deleteVaultResource } = useHubStore();
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "link" as const,
    category: "links" as const,
    url: "",
    description: "",
    size: ""
  });

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [viewMode, vaultResources]);

  const filteredResources = vaultResources.filter(res => res.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const folders = filteredResources.filter(r => r.type === 'folder' || r.type === 'link');
  const documents = filteredResources.filter(r => r.type === 'pdf' || r.type === 'doc');
  const sops = filteredResources.filter(r => r.type === 'sop');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalUrl = newResource.url;
      let finalSize = newResource.size;
      
      if (file && !["link", "folder"].includes(newResource.type)) {
        const fileRef = ref(storage, `vault_resources/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        finalUrl = await getDownloadURL(fileRef);
        finalSize = (file.size / 1024 / 1024).toFixed(1) + " MB";
      }

      await addVaultResource({ ...newResource, url: finalUrl, size: finalSize });
      setIsCreating(false);
      setNewResource({ name: "", type: "link", category: "links", url: "", description: "", size: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderResourceCard = (res: any) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      key={res.id} 
      className="glass-panel fade-up"
      style={{ 
        padding: "20px", display: "flex", 
        flexDirection: viewMode === "grid" ? "column" : "row", 
        alignItems: viewMode === "grid" ? "flex-start" : "center",
        justifyContent: "space-between", gap: 16, border: "1px solid var(--border)",
        height: viewMode === "grid" ? "100%" : "auto"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, width: "100%" }}>
        <div style={{ 
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: res.type === 'folder' ? "rgba(245, 158, 11, 0.1)" : "var(--bg-muted)", 
          color: res.type === 'folder' ? "#F59E0B" : "var(--brand)",
          display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          {res.type === 'folder' ? <Folder size={24} /> : res.type === 'link' ? <LinkIcon size={24} /> : <FileText size={24} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {res.name}
            </h3>
            <button onClick={() => deleteVaultResource(res.id)} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", padding: 4 }}>
              <Trash2 size={16} />
            </button>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", color: "var(--brand)", background: "var(--brand-glow)", padding: "2px 6px", borderRadius: 4 }}>
              {res.type}
            </span>
            {res.size && <span>• {res.size}</span>}
            {res.items !== undefined && <span>• {res.items} items</span>}
          </p>
          {viewMode === "grid" && res.description && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>{res.description}</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => {
          if (res.url) window.open(res.url, "_blank");
          else alert("No URL provided for this resource.");
        }}
        style={{ 
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
              SOPs, Brand Kits & Official Docs
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="glass-panel" style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white",
          border: "none", borderRadius: 16, padding: "12px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
          transition: "transform 0.2s"
        }}>
          <Plus size={18} /> Upload Resource
        </button>
      </header>

      {/* Toolbar */}
      <div className="fade-up" style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 44px", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "white", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}
          />
        </div>
        <div className="glass-panel" style={{ display: "flex", padding: 6, borderRadius: 14, background: "white", border: "1.5px solid var(--border-strong)" }}>
          <button onClick={() => setViewMode("grid")} style={{ padding: 8, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "grid" ? "var(--bg-muted)" : "transparent", color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode("list")} style={{ padding: 8, borderRadius: 10, border: "none", cursor: "pointer", background: viewMode === "list" ? "var(--bg-muted)" : "transparent", color: viewMode === "list" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
            <List size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {folders.length > 0 && (
          <section>
            <h2 className="outfit-font fade-up" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Folder size={20} color="var(--brand)" /> Kits & Drives
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {folders.map(renderResourceCard)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section>
            <h2 className="outfit-font fade-up" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={20} color="#10B981" /> Official Documents
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {documents.map(renderResourceCard)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {sops.length > 0 && (
          <section>
            <h2 className="outfit-font fade-up" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={20} color="#F59E0B" /> SOPs & Guidelines
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {sops.map(renderResourceCard)}
              </AnimatePresence>
            </div>
          </section>
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="cmdk-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setIsCreating(false)}>
          <div className="glass-panel" style={{ width: 450, padding: 24, background: "white" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800 }}>Upload Resource</h2>
              <button onClick={() => setIsCreating(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Resource Name</label>
                <input required value={newResource.name} onChange={e => setNewResource({...newResource, name: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="e.g. Logo Kit" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Type</label>
                  <select required value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }}>
                    <option value="link">Link</option>
                    <option value="folder">Folder</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Doc</option>
                    <option value="sop">SOP</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Category</label>
                  <select required value={newResource.category} onChange={e => setNewResource({...newResource, category: e.target.value as any})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }}>
                    <option value="links">Links/Drives</option>
                    <option value="documents">Documents</option>
                    <option value="sops">SOPs</option>
                    <option value="assets">Assets</option>
                  </select>
                </div>
              </div>
              
              {!["link", "folder"].includes(newResource.type) ? (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Upload File</label>
                  <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>URL / Link</label>
                  <input required type="url" value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14 }} placeholder="https://..." />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>Description (Optional)</label>
                <textarea value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-strong)", fontSize: 14, minHeight: 60 }} placeholder="Brief info..." />
              </div>
              
              <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 14, background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Uploading..." : "Save Resource"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
