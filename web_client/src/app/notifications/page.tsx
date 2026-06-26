"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { UserRole } from "@/types/models";
import gsap from "gsap";
import { Bell, Megaphone, Info, CheckCircle2, AlertTriangle, AlertCircle, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const TYPE_CONFIG = {
  info:    { color: "var(--brand)", bg: "var(--brand-glow)", icon: Info },
  success: { color: "#059669", bg: "rgba(5,150,105,0.1)", icon: CheckCircle2 },
  warning: { color: "#D97706", bg: "rgba(217,119,6,0.1)", icon: AlertTriangle },
  error:   { color: "#DC2626", bg: "rgba(220,38,38,0.1)", icon: AlertCircle },
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, isLoading, markAllRead, createAnnouncement } = useNotificationsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "info" as "info" | "success" | "warning" | "error" });
  const [submitting, setSubmitting] = useState(false);

  const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";
  const isAdmin = user?.role === UserRole.chapterAdmin || user?.email === ROOT_ADMIN;

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".fade-up"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await markAllRead(user.id);
    toast.success("All notifications marked as read.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    try {
      await createAnnouncement(form.title, form.body, form.type);
      setForm({ title: "", body: "", type: "info" });
      setShowForm(false);
      toast.success("Announcement broadcast!");
    } catch {
      toast.error("Failed to send announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} style={{ padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={22} color="var(--brand)" />
          </div>
          <div>
            <h1 className="outfit-font" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginTop: 2 }}>
                {unreadCount} unread {unreadCount === 1 ? "alert" : "alerts"}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)", background: "var(--brand-glow)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>
              Mark all read
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: showForm ? "var(--bg-elevated)" : "linear-gradient(135deg, var(--brand), #4338CA)",
                color: showForm ? "var(--text-secondary)" : "white",
                border: showForm ? "1px solid var(--border)" : "none",
                borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: showForm ? "none" : "0 4px 14px var(--brand-glow)",
              }}
            >
              {showForm ? <><X size={15} /> Cancel</> : <><Megaphone size={15} /> Announce</>}
            </button>
          )}
        </div>
      </div>

      {/* Announce Form (Admin only) */}
      <AnimatePresence>
        {showForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="glass-panel fade-up"
            style={{ padding: 24, marginBottom: 24, border: "2px solid var(--brand-glow)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Plus size={16} color="var(--brand)" />
              <h3 className="outfit-font" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                Broadcast Announcement
              </h3>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lSt}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Announcement title..." style={inputSt} />
              </div>
              <div>
                <label style={lSt}>Message</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required rows={3} placeholder="What would you like everyone to know?" style={{ ...inputSt, resize: "vertical" }} />
              </div>
              <div>
                <label style={lSt}>Type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["info", "success", "warning", "error"] as const).map(t => {
                    const cfg = TYPE_CONFIG[t];
                    return (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                        flex: 1, padding: "10px 8px", borderRadius: 10, border: form.type === t ? `2px solid ${cfg.color}` : "1.5px solid var(--border)",
                        background: form.type === t ? cfg.bg : "white", color: cfg.color, fontSize: 12, fontWeight: 800,
                        cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s"
                      }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, var(--brand), #4338CA)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Broadcasting…" : "Send to All Members"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: 88, borderRadius: 16 }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel fade-up" style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border-strong)" }}>
          <Bell size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)" }}>No notifications yet.</p>
          {isAdmin && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Broadcast your first announcement above.</p>}
        </div>
      ) : (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence>
            {notifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
              const Icon = cfg.icon;
              const isUnread = !notif.readBy?.includes(user?.id ?? "");
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="glass-panel"
                  style={{
                    padding: "18px 20px", border: `1px solid ${isUnread ? cfg.color + "33" : "var(--border)"}`,
                    background: isUnread ? cfg.bg : undefined,
                    display: "flex", gap: 16, alignItems: "flex-start",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{notif.title}</h3>
                      {isUnread && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0, marginTop: 6 }} />
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>{notif.body}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {notif.createdAt ? new Date((notif.createdAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Just now"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const lSt: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontSize: 11, fontWeight: 800, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.06em",
};

const inputSt: React.CSSProperties = {
  width: "100%", background: "var(--bg-elevated)", border: "1.5px solid var(--border-strong)",
  borderRadius: 12, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
};
