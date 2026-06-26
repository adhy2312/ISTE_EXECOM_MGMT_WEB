import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: 24,
      textAlign: "center"
    }}>
      <div className="glass-panel fade-up" style={{ padding: 40, maxWidth: 460 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Search size={32} color="var(--brand)" />
        </div>
        <h1 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          The module or page you are looking for doesn&apos;t exist or you don&apos;t have the necessary privileges to view it.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--brand)", color: "white", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-md)" }}>
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
