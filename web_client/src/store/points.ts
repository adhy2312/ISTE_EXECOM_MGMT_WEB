import { create } from 'zustand';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EnergyPointRequest, EnergyPointStatus } from '@/types/models';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';

// Key for offline requests in IndexedDB
const OFFLINE_QUEUE_KEY = 'offline_point_requests';

interface PointsStore {
  requests: EnergyPointRequest[];
  isLoading: boolean;
  error: string | null;
  // Member actions
  submitRequest: (data: Omit<EnergyPointRequest, 'id' | 'status' | 'submittedAt'>) => Promise<void>;
  fetchMyRequests: (memberId: string) => Promise<void>;
  // Chair actions
  fetchAllPending: () => Promise<void>;
  approveRequest: (id: string, awardedPoints: number, note: string, memberId: string, adminId: string) => Promise<void>;
  rejectRequest: (id: string, note: string, adminId: string) => Promise<void>;
}

export const usePointsStore = create<PointsStore>((set) => ({
  requests: [],
  isLoading: false,
  error: null,

  submitRequest: async (data) => {
    set({ isLoading: true, error: null });
    const payload = {
      ...data,
      status: EnergyPointStatus.pending,
      submittedAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      // Offline mode: queue in IndexedDB
      const queue = (await idbGet<Omit<EnergyPointRequest, 'id'>[]>(OFFLINE_QUEUE_KEY)) || [];
      queue.push(payload as Omit<EnergyPointRequest, 'id'>);
      await idbSet(OFFLINE_QUEUE_KEY, queue);
      set({ isLoading: false });
      return;
    }

    try {
      await addDoc(collection(db, 'energyPointRequests'), payload);
      set({ isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  fetchMyRequests: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(
        collection(db, 'energyPointRequests'),
        where('memberId', '==', memberId),
        orderBy('submittedAt', 'desc')
      );
      const snap = await getDocs(q);
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as EnergyPointRequest));
      set({ requests, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchAllPending: async () => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'energyPointRequests'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as EnergyPointRequest));
      set({ requests, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  approveRequest: async (id, awardedPoints, note, memberId, adminId) => {
    set({ isLoading: true });
    try {
      // 1. Update request status
      await updateDoc(doc(db, 'energyPointRequests', id), {
        status: EnergyPointStatus.approved,
        awardedPoints,
        chairpersonNote: note,
        reviewedAt: new Date().toISOString(),
      });
      // 2. Increment member's core points
      const memberRef = doc(db, 'users', memberId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const currentPoints = memberSnap.data().corePoints ?? 0;
        await updateDoc(memberRef, { corePoints: currentPoints + awardedPoints });
      }
      // 3. Log to audit_logs
      await addDoc(collection(db, 'audit_logs'), {
        adminId,
        action: 'APPROVE_POINTS',
        targetId: id,
        awardedPoints,
        timestamp: new Date().toISOString()
      });
      // 4. Refresh local state
      set(state => ({
        isLoading: false,
        requests: state.requests.map(r =>
          r.id === id ? { ...r, status: EnergyPointStatus.approved, awardedPoints, chairpersonNote: note } : r
        ),
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  rejectRequest: async (id, note, adminId) => {
    set({ isLoading: true });
    try {
      await updateDoc(doc(db, 'energyPointRequests', id), {
        status: EnergyPointStatus.rejected,
        chairpersonNote: note,
        reviewedAt: new Date().toISOString(),
      });
      // Log to audit_logs
      await addDoc(collection(db, 'audit_logs'), {
        adminId,
        action: 'REJECT_POINTS',
        targetId: id,
        timestamp: new Date().toISOString()
      });
      set(state => ({
        isLoading: false,
        requests: state.requests.map(r =>
          r.id === id ? { ...r, status: EnergyPointStatus.rejected, chairpersonNote: note } : r
        ),
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },
}));

// Setup global online listener to sync offline data
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    try {
      const queue = await idbGet<Omit<EnergyPointRequest, 'id'>[]>(OFFLINE_QUEUE_KEY);
      if (queue && queue.length > 0) {
        for (const item of queue) {
          await addDoc(collection(db, 'energyPointRequests'), item);
        }
        await idbDel(OFFLINE_QUEUE_KEY);
        console.log(`Synced ${queue.length} offline point requests!`);
        // We could trigger a refetch here if we had access to the user id, 
        // but typically the UI will reload or the user will navigate.
      }
    } catch (err) {
      console.error("Failed to sync offline requests", err);
    }
  });
}
