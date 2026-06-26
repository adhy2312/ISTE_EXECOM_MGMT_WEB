"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/models";
import { Zap, CheckSquare, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";

const ROOT_ADMIN = "adhithyamohans.b24ec1205@mbcet.ac.in";

type LoginMode = "admin" | "execom" | "faculty";

const MODE: Record<LoginMode, { label: string; sub: string; color: string; dot: string; placeholder: string }> = {
  admin: {
    label: "Admin",
    sub: "PR Head & Executive Access",
    color: "#3730A3",
    dot: "#818CF8",
    placeholder: "prhead@mbcet.ac.in",
  },
  execom: {
    label: "ExeCom",
    sub: "Executive Committee Member",
    color: "#EA580C",
    dot: "#FB923C",
    placeholder: "member@mbcet.ac.in",
  },
  faculty: {
    label: "Faculty",
    sub: "Faculty Advisor — Read Only",
    color: "#0D9488",
    dot: "#2DD4BF",
    placeholder: "faculty@mbcet.ac.in",
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<LoginMode>("execom");
  const [modeError, setModeError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginAttempted = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  const { loginWithEmail, loginWithGoogle, error, user, isLoading, logout, initAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsub = initAuth();
    return () => unsub();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && user) {
      const isAdmin = user.role === UserRole.chapterAdmin || user.email === ROOT_ADMIN;
      const isFaculty = user.role === UserRole.facultyAdvisor;

      if (loginAttempted.current) {
        loginAttempted.current = false;
        // Enforce portal rules
        if (mode === "admin" && !isAdmin) {
          setTimeout(() => setModeError("Admin portal is restricted to the PR Head only."), 0);
          logout();
          return;
        }
        if (mode === "faculty" && !isAdmin && !isFaculty) {
          setTimeout(() => setModeError("Faculty portal is for Faculty Advisors only."), 0);
          logout();
          return;
        }
        if (mode === "execom" && isFaculty && !isAdmin) {
          setTimeout(() => setModeError("Faculty Advisors must use the Faculty login portal."), 0);
          logout();
          return;
        }
      }

      // Route based on role
      if (isAdmin) router.replace("/executive");
      else if (isFaculty) router.replace("/faculty");
      else router.replace("/");
    }
  }, [user, isLoading, router, mode, logout]);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" }
    );
    if (decorRef.current) {
      gsap.fromTo(decorRef.current.querySelectorAll(".decor-item"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power2.out", delay: 0.3 }
      );
    }
  }, []);

  // Animate card when mode changes
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current.querySelector(".mode-content"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [mode]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setModeError("");
    loginAttempted.current = true;
    setSubmitting(true);
    try { await loginWithEmail(email, password, rememberMe); }
    catch { /* error in store */ }
    finally { setSubmitting(false); }
  };

  const handleGoogle = async () => {
    setModeError("");
    loginAttempted.current = true;
    setSubmitting(true);
    try { await loginWithGoogle(rememberMe); }
    catch { /* error in store */ }
    finally { setSubmitting(false); }
  };

  const m = MODE[mode];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── Organic background shapes ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-8%",
          width: "55vw", height: "55vw", maxWidth: 500, maxHeight: 500,
          borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
          background: `radial-gradient(circle, ${m.color}18 0%, transparent 70%)`,
          filter: "blur(60px)", willChange: "transform",
          transition: "background 0.8s ease",
          animation: "blobDrift 18s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "50vw", height: "50vw", maxWidth: 450, maxHeight: 450,
          borderRadius: "45% 55% 60% 40% / 55% 40% 60% 45%",
          background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
          filter: "blur(70px)", willChange: "transform",
          animation: "blobDrift2 22s ease-in-out infinite alternate",
        }} />
        {/* Decorative grid dots */}
        <svg style={{ position: "absolute", top: "10%", right: "5%", opacity: 0.12, width: 160, height: 160 }} viewBox="0 0 160 160">
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 28 + 14} cy={row * 28 + 14} r={2.5} fill={m.color} />
            ))
          )}
        </svg>
      </div>

      {/* ── Decorative left column (hides on narrow screens) ── */}
      <div ref={decorRef} style={{
        display: "none",
        flexDirection: "column", gap: 40, maxWidth: 320, marginRight: 64,
        position: "relative", zIndex: 1,
      }}
        className="left-decor"
      >
        <div className="decor-item">
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>ISTE SC MBCET</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 42, lineHeight: 1.15, color: "var(--text-primary)", fontWeight: 700 }}>
            Where ideas<br />become<br /><span style={{ color: m.color }}>actions.</span>
          </h2>
        </div>
        <div className="decor-item" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: Zap, label: "Live XP Leaderboard" },
            { icon: CheckSquare, label: "Task Matrix & Tracking" },
            { icon: ShieldCheck, label: "Role-Based Access" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color }}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{f.label}</span>
              </div>
            );
          })}
        </div>
        <div className="decor-item" style={{ padding: "16px 20px", background: "white", borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
            &quot;Built for the people running things — not just watching.&quot;
          </p>
        </div>
      </div>

      {/* ── Login Card ── */}
      <div ref={cardRef} style={{
        width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: "1px solid var(--border)",
        borderRadius: 28,
        padding: "38px 34px",
        boxShadow: "var(--shadow-xl)",
      }}>

        {/* Role selector pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 30, background: "var(--bg-muted)", padding: 4, borderRadius: 16 }}>
          {(Object.keys(MODE) as LoginMode[]).map((k) => {
            const active = mode === k;
            return (
              <button key={k} onClick={() => setMode(k)} style={{
                flex: 1, padding: "9px 0", borderRadius: 12,
                border: "none", cursor: "pointer",
                background: active ? "white" : "transparent",
                color: active ? MODE[k].color : "var(--text-muted)",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                textTransform: "uppercase",
                boxShadow: active ? "var(--shadow-sm)" : "none",
                transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
              }}>
                {MODE[k].label}
              </button>
            );
          })}
        </div>

        {/* Brand mark */}
        <div className="mode-content" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 20px ${m.color}25, 0 2px 6px rgba(0,0,0,0.08)`,
              border: "1.5px solid var(--border)",
              flexShrink: 0,
              transition: "box-shadow 0.4s ease",
              overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ISTE SC MBCET Logo"
                style={{ width: 44, height: 44, objectFit: "contain" }}
              />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                ISTE SC MBCET
              </h1>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{m.sub}</p>
            </div>
          </div>

          {/* Warm divider */}
          <div style={{ height: 1, background: `linear-gradient(to right, ${m.color}30, transparent)`, marginBottom: 22 }} />
        </div>

        {/* Error / Mode Error */}
        {(error || modeError) && (
          <div style={{
            background: "var(--error-light)", border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 18,
            color: "var(--error)", fontSize: 13, lineHeight: 1.5,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {modeError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelSt}>Email</label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder={m.placeholder}
              style={inputSt}
              onFocus={(e) => { e.target.style.borderColor = m.color; e.target.style.boxShadow = `0 0 0 3px ${m.color}18`; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelSt}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} value={password} required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputSt, paddingRight: 40 }}
                onFocus={(e) => { e.target.style.borderColor = m.color; e.target.style.boxShadow = `0 0 0 3px ${m.color}18`; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, marginBottom: 4 }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: m.color, width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", userSelect: "none", fontWeight: 500 }}>
              Keep me signed in
            </label>
          </div>

          <button type="submit" disabled={submitting} style={{
            marginTop: 6,
            background: `linear-gradient(135deg, ${m.color}, ${m.dot})`,
            color: "white", border: "none", borderRadius: 14,
            padding: "14px", fontSize: 15, fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.75 : 1,
            boxShadow: `0 4px 16px ${m.color}30`,
            transition: "all 0.22s ease",
            letterSpacing: "-0.01em",
          }}>
            {submitting ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-strong)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-strong)" }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle} disabled={submitting}
          style={{
            width: "100%", background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)", borderRadius: 14,
            padding: "13px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.1-2.7-.5-4z" />
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 11.7z" />
            <path fill="#FBBC05" d="M24 45c5.5 0 10.6-1.9 14.5-5.1l-6.7-5.5C29.7 36.1 27 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.2 40.8 15.5 45 24 45z" />
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3-3.3 5.4-6.3 6.9l6.7 5.5c4.1-3.8 6.8-9.4 6.8-16.9 0-1.4-.1-2.7-.5-4z" />
          </svg>
          Continue with Google Workspace
        </button>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Access restricted to <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>@mbcet.ac.in</span> accounts
        </p>
      </div>

      {/* Blob animation keyframes */}
      <style>{`
        @keyframes blobDrift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(4%,6%) scale(1.06); }
          100% { transform: translate(-3%,10%) scale(0.96); }
        }
        @keyframes blobDrift2 {
          0%   { transform: translate(0,0) scale(1.05); }
          50%  { transform: translate(-5%,-4%) scale(0.95); }
          100% { transform: translate(4%,-8%) scale(1.08); }
        }
        @media (min-width: 860px) {
          .left-decor { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const labelSt: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontSize: 12, fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.06em",
};
const inputSt: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text-primary)",
  fontSize: 15, outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};
