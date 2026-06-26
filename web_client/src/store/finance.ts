import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, addDoc } from 'firebase/firestore';
import { FinanceRecord } from '@/types/models';
import { cleanPayload } from "@/utils/helpers";

interface FinanceState {
  records: FinanceRecord[];
  isLoading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<FinanceRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  records: [],
  isLoading: false,
  error: null,

  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'finances'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceRecord));
      set({ records, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message || 'Failed to fetch finance records', isLoading: false });
    }
  },

  addRecord: async (recordData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = cleanPayload({
        ...recordData,
        createdAt: new Date().toISOString(),
      });
      const docRef = await addDoc(collection(db, "finances"), payload);
      const newRecord: FinanceRecord = {
        id: docRef.id,
        ...recordData,
        createdAt: payload.createdAt as string,
      };
      set((state) => ({ records: [newRecord, ...state.records], isLoading: false }));
    } catch (err: unknown) {
      set({ error: (err as Error).message || 'Failed to add finance record', isLoading: false });
    }
  },

  updateRecord: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const recordRef = doc(db, 'finances', id);
      await setDoc(recordRef, updates, { merge: true });
      set((state) => ({
        records: state.records.map(r => r.id === id ? { ...r, ...updates } : r),
        isLoading: false
      }));
    } catch (err: unknown) {
      set({ error: (err as Error).message || 'Failed to update finance record', isLoading: false });
    }
  },

  deleteRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'finances', id));
      set((state) => ({
        records: state.records.filter(r => r.id !== id),
        isLoading: false
      }));
    } catch (err: unknown) {
      set({ error: (err as Error).message || 'Failed to delete finance record', isLoading: false });
    }
  },
}));
