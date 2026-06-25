"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const PUBLIC_PATHS = ["/", "/login", "/bootstrap"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = initAuth();
    return () => unsub();
  }, [initAuth]);

  useEffect(() => {
    if (isLoading) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  // Realtime popups for new point requests (Admins only)
  useEffect(() => {
    if (!user || user.role !== "chapterAdmin") return;

    let initialLoad = true;
    const q = query(
      collection(db, "energyPointRequests"),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      if (initialLoad) {
        initialLoad = false;
        return;
      }
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          toast.info(`New XP Request: ${data.memberName}`, {
            description: `${data.requestedPoints} XP for ${data.category}`,
            action: {
              label: "Review",
              onClick: () => router.push("/executive"),
            },
            duration: 8000,
          });
        }
      });
    });

    return () => unsub();
  }, [user, router]);

  return <>{children}</>;
}
