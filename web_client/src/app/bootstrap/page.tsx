"use client";
/**
 * One-time Admin Bootstrap page — accessible at /bootstrap
 * This page creates your Firestore profile + allowedUsers entry
 * using your active browser session (authenticated as chapterAdmin).
 * DELETE this file once setup is complete.
 */
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

const ADMIN_EMAIL = "adhithyamohans.b24ec1205@mbcet.ac.in";

export default function BootstrapPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  const log = (msg: string) => setStatus((s) => [...s, msg]);

  const run = async () => {
    setRunning(true);
    setStatus([]);
    try {
      // 1. Sign in
      log("🔐 Signing in as admin...");
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, "Adhy@2006");
      const uid = cred.user.uid;
      log(`✅ Signed in — UID: ${uid}`);

      // 2. Write Firestore user profile
      log("📝 Writing user profile to Firestore...");
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          id: uid,
          fullName: "Adhithya Mohan S",
          email: ADMIN_EMAIL,
          branchBatch: "B24EC",
          department: "EC",
          contact: "",
          skills: ["Leadership", "Management"],
          areasOfExpertise: "Society Management",
          socialLinks: {},
          role: "chapterAdmin",
          designation: "Chairperson",
          activeStatus: "active",
          corePoints: 0,
        });
        log("✅ User profile created.");
      } else {
        await setDoc(userRef, { role: "chapterAdmin", designation: "Chairperson" }, { merge: true });
        log("✅ User profile updated — chapterAdmin role confirmed.");
      }

      // 3. Write allowedUsers whitelist entry
      log("🛡️ Adding to allowedUsers whitelist...");
      await setDoc(doc(db, "allowedUsers", ADMIN_EMAIL.toLowerCase()), {
        email: ADMIN_EMAIL.toLowerCase(),
        role: "chapterAdmin",
        designation: "Chairperson",
        addedBy: "bootstrap",
        addedAt: new Date().toISOString(),
        isActive: true,
      });
      log("✅ Added to allowedUsers whitelist.");

      log("");
      log("🎉 Bootstrap complete! You can now log in at /login");
      log("   Delete the /bootstrap page after this.");
      setDone(true);
    } catch (e: unknown) {
      log(`❌ Error: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "#09090B",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 540,
        background: "rgba(24,24,27,0.7)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 36,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#C4B5FD", fontFamily: "'Outfit',sans-serif" }}>
            🌱 Admin Bootstrap
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: 13, marginTop: 6 }}>
            One-time setup to provision your admin account in Firestore and the access whitelist.
            <br /><strong style={{ color: "#FCD34D" }}>Delete /bootstrap after running.</strong>
          </p>
        </div>

        <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 4 }}>Will configure:</div>
          <div style={{ fontSize: 13, color: "white" }}>📧 {ADMIN_EMAIL}</div>
          <div style={{ fontSize: 13, color: "#C4B5FD" }}>👑 Role: Chairperson (chapterAdmin)</div>
        </div>

        {!done && (
          <button
            onClick={run}
            disabled={running}
            style={{
              width: "100%", background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
              color: "white", border: "none", borderRadius: 12, padding: "13px",
              fontSize: 15, fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
              opacity: running ? 0.7 : 1, marginBottom: 16,
            }}
          >
            {running ? "Running bootstrap…" : "Run Bootstrap Now"}
          </button>
        )}

        {done && (
          <a href="/login" style={{
            display: "block", width: "100%", background: "linear-gradient(135deg,#10B981,#059669)",
            color: "white", border: "none", borderRadius: 12, padding: "13px",
            fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 16,
            textAlign: "center", textDecoration: "none",
          }}>
            ✅ Go to Login →
          </a>
        )}

        {status.length > 0 && (
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "12px 14px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
            {status.map((line, i) => (
              <div key={i} style={{ color: line.startsWith("❌") ? "#FCA5A5" : line.startsWith("🎉") || line.startsWith("✅") ? "#6EE7B7" : "#A1A1AA" }}>
                {line || " "}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
