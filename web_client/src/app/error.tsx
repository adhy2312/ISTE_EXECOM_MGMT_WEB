"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log this to an error tracking service here (e.g. Sentry)
    console.error("Global Error Caught:", error);
  }, [error]);

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
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--error-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <AlertTriangle size={32} color="var(--error)" />
        </div>
        <h1 className="outfit-font" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          A critical error occurred while rendering this page. Our systems have logged the incident. 
          Please try refreshing or returning to the dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--brand)", color: "white", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)" }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "var(--text-primary)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
