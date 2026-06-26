import { create } from 'zustand';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AllowedUser, UserRole } from '@/types/models';

interface AdminState {
  allowedUsers: AllowedUser[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  // Fetch & subscribe
  subscribeToAllowedUsers: () => Unsubscribe;
  fetchAllowedUsers: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  // CRUD
  addAllowedUser: (data: Omit<AllowedUser, 'addedAt'>) => Promise<void>;
  updateAllowedUser: (email: string, updates: Partial<AllowedUser>) => Promise<void>;
  removeAllowedUser: (email: string) => Promise<void>;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  awardedPoints?: number;
  timestamp: string;
}

export const useAdminStore = create<AdminState>((set) => ({
  allowedUsers: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  subscribeToAllowedUsers: () => {
    const q = collection(db, 'allowedUsers');
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map((d) => ({ email: d.id, ...d.data() } as AllowedUser));
      // Sort: admins first, then alphabetically
      users.sort((a, b) => {
        if (a.role === UserRole.chapterAdmin && b.role !== UserRole.chapterAdmin) return -1;
        if (b.role === UserRole.chapterAdmin && a.role !== UserRole.chapterAdmin) return 1;
        return (a.email || "").localeCompare(b.email || "");
      });
      set({ allowedUsers: users });
    }, (err) => {
      set({ error: err.message });
    });
    return unsub;
  },

  fetchAllowedUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const snap = await getDocs(collection(db, 'allowedUsers'));
      const users = snap.docs.map((d) => ({ email: d.id, ...d.data() } as AllowedUser));
      users.sort((a, b) => {
        if (a.role === UserRole.chapterAdmin && b.role !== UserRole.chapterAdmin) return -1;
        if (b.role === UserRole.chapterAdmin && a.role !== UserRole.chapterAdmin) return 1;
        return (a.email || "").localeCompare(b.email || "");
      });
      set({ allowedUsers: users, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchAuditLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
      set({ auditLogs: logs, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  addAllowedUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const emailKey = data.email.toLowerCase().trim();
      await setDoc(doc(db, 'allowedUsers', emailKey), {
        ...data,
        email: emailKey,
        addedAt: new Date().toISOString(),
      });
      set({ isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  updateAllowedUser: async (email, updates) => {
    set({ isLoading: true, error: null });
    try {
      const emailKey = email.toLowerCase().trim();
      await updateDoc(doc(db, 'allowedUsers', emailKey), updates);
      set({ isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  removeAllowedUser: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const emailKey = email.toLowerCase().trim();
      await deleteDoc(doc(db, 'allowedUsers', emailKey));
      set({ isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },
}));
