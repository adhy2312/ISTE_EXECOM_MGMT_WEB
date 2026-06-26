"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Home, LayoutDashboard, ShieldCheck, Database, Award, UserCog, CheckCircle, ChevronRight } from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";
import { UserRole, ExecomMember } from "@/types/models";
import "./command-menu.css";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<ExecomMember[]>([]);
  const [view, setView] = useState<"main" | "assignRole">("main");
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin = user?.role === UserRole.chapterAdmin;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch users if admin
  useEffect(() => {
    if (open && isAdmin && users.length === 0) {
      getDocs(collection(db, "users")).then((snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExecomMember)));
      });
    }
  }, [open, isAdmin, users.length]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    setView("main");
    command();
  };

  const assignRole = async (targetUser: ExecomMember, newRole: string, designation: string) => {
    if (!isAdmin) return;
    try {
      // 1. Update whitelist so it persists
      await setDoc(doc(db, "allowedUsers", targetUser.email.toLowerCase()), {
        email: targetUser.email,
        role: newRole,
        designation,
        isActive: true,
      }, { merge: true });
      // 2. Update actual user profile
      await updateDoc(doc(db, "users", targetUser.id), {
        role: newRole,
        designation,
      });
      // 3. Close & Reset
      runCommand(() => alert(`${targetUser.fullName} is now a ${designation}!`));
    } catch (e) {
      console.error("Failed to assign role", e);
      alert("Failed to assign role. Check permissions.");
    }
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={() => { setOpen(false); setView("main"); }}>
      <div className="cmdk-dialog" onClick={(e) => e.stopPropagation()}>
        <Command>
          <div className="cmdk-header">
            <Search size={18} className="cmdk-search-icon" />
            <Command.Input placeholder={view === "main" ? "Type a command or search..." : "Assign role to a user..."} autoFocus />
            <div className="cmdk-esc" onClick={() => {
              if (view !== "main") setView("main");
              else setOpen(false);
            }} style={{ cursor: "pointer" }}>
              {view === "main" ? "ESC" : "BACK"}
            </div>
          </div>
          
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {view === "main" && (
              <>
                <Command.Group heading="Navigation">
                  <Command.Item onSelect={() => runCommand(() => router.push("/"))}>
                    <Home size={16} /> Home
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/hub"))}>
                    <LayoutDashboard size={16} /> Operations Hub
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/executive"))}>
                    <ShieldCheck size={16} /> Executive Panel
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/directory"))}>
                    <UserCog size={16} /> Executive Directory
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/observatory"))}>
                    <Database size={16} /> Faculty Observatory
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Quick Actions">
                  <Command.Item onSelect={() => runCommand(() => router.push("/points"))}>
                    <Award size={16} /> Submit Point Request
                  </Command.Item>
                </Command.Group>

                {isAdmin && (
                  <Command.Group heading="Admin Controls">
                    <Command.Item onSelect={() => setView("assignRole")}>
                      <UserCog size={16} color="var(--brand)" /> 
                      <span style={{ color: "var(--brand)" }}>Assign Roles to Members</span>
                      <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--brand)" }} />
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => router.push("/executive"))}>
                      <CheckCircle size={16} color="#059669" /> 
                      <span style={{ color: "#059669" }}>Mass Approve Points (Executive)</span>
                    </Command.Item>
                  </Command.Group>
                )}
              </>
            )}

            {view === "assignRole" && (
              <Command.Group heading="Select User to Promote">
                {users.map(u => (
                  <Command.Item 
                    key={u.id} 
                    value={`${u.fullName} ${u.email}`} 
                    onSelect={() => {
                      const role = prompt(`Promote ${u.fullName}\nType "faculty" or "admin":`);
                      if (role === "faculty") assignRole(u, UserRole.facultyAdvisor, "Faculty Advisor");
                      else if (role === "admin") assignRole(u, UserRole.chapterAdmin, "Chapter Admin");
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.fullName}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{u.email} • Current: {u.role}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

          </Command.List>
        </Command>
      </div>
    </div>
  );
}
