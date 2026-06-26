import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { FinanceRecord } from '@/types/models';

interface FinanceState {
  records: FinanceRecord[];
  isLoading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<FinanceRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
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
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch finance records', isLoading: false });
    }
  },

  addRecord: async (recordData) => {
    set({ isLoading: true, error: null });
    try {
      const id = Date.now().toString();
      const newRecord: FinanceRecord = {
        id,
        ...recordData,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'finances', id), newRecord);
      set((state) => ({ records: [newRecord, ...state.records], isLoading: false }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add finance record', isLoading: false });
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
    } catch (err: any) {
      set({ error: err.message || 'Failed to update finance record', isLoading: false });
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
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete finance record', isLoading: false });
    }
  },
}));
