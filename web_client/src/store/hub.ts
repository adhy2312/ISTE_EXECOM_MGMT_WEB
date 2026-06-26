import { create } from "zustand";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { HubEvent, HubMeeting, HubVaultResource, HubAssetRequest } from "@/types/hub";

interface HubState {
  events: HubEvent[];
  meetings: HubMeeting[];
  vaultResources: HubVaultResource[];
  assetRequests: HubAssetRequest[];
  loading: boolean;
  
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<HubEvent, 'id' | 'createdAt'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  fetchMeetings: () => Promise<void>;
  addMeeting: (meeting: Omit<HubMeeting, 'id' | 'createdAt'>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;

  fetchVault: () => Promise<void>;
  addVaultResource: (resource: Omit<HubVaultResource, 'id' | 'createdAt'>) => Promise<void>;
  deleteVaultResource: (id: string) => Promise<void>;

  fetchAssetRequests: () => Promise<void>;
  requestAsset: (req: Omit<HubAssetRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateAssetRequest: (id: string, status: "pending" | "approved" | "rejected") => Promise<void>;
}

export const useHubStore = create<HubState>((set, get) => ({
  events: [],
  meetings: [],
  vaultResources: [],
  assetRequests: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const evts = snap.docs.map(d => ({ id: d.id, ...d.data() } as HubEvent));
      set({ events: evts, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  
  addEvent: async (evt) => {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        ...evt,
        createdAt: Date.now()
      });
      const newEvt = { id: docRef.id, ...evt, createdAt: Date.now() } as HubEvent;
      set((state) => ({ events: [newEvt, ...state.events] }));
    } catch (error) {
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await deleteDoc(doc(db, "events", id));
      set((state) => ({ events: state.events.filter(e => e.id !== id) }));
    } catch (error) {
      throw error;
    }
  },

  fetchMeetings: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const m = snap.docs.map(d => ({ id: d.id, ...d.data() } as HubMeeting));
      set({ meetings: m, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  
  addMeeting: async (meeting) => {
    try {
      const docRef = await addDoc(collection(db, "meetings"), {
        ...meeting,
        createdAt: Date.now()
      });
      const newM = { id: docRef.id, ...meeting, createdAt: Date.now() } as HubMeeting;
      set((state) => ({ meetings: [newM, ...state.meetings] }));
    } catch (error) {
      throw error;
    }
  },

  deleteMeeting: async (id) => {
    try {
      await deleteDoc(doc(db, "meetings", id));
      set((state) => ({ meetings: state.meetings.filter(m => m.id !== id) }));
    } catch (error) {
      throw error;
    }
  },

  fetchVault: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, "vault_resources"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const v = snap.docs.map(d => ({ id: d.id, ...d.data() } as HubVaultResource));
      set({ vaultResources: v, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  
  addVaultResource: async (resource) => {
    try {
      const docRef = await addDoc(collection(db, "vault_resources"), {
        ...resource,
        createdAt: Date.now()
      });
      const newV = { id: docRef.id, ...resource, createdAt: Date.now() } as HubVaultResource;
      set((state) => ({ vaultResources: [newV, ...state.vaultResources] }));
    } catch (error) {
      throw error;
    }
  },

  deleteVaultResource: async (id) => {
    try {
      await deleteDoc(doc(db, "vault_resources", id));
      set((state) => ({ vaultResources: state.vaultResources.filter(v => v.id !== id) }));
    } catch (error) {
      throw error;
    }
  },

  fetchAssetRequests: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, "asset_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as HubAssetRequest));
      set({ assetRequests: reqs, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  requestAsset: async (req) => {
    try {
      const docRef = await addDoc(collection(db, "asset_requests"), {
        ...req,
        createdAt: Date.now()
      });
      const newReq = { id: docRef.id, ...req, createdAt: Date.now() } as HubAssetRequest;
      set((state) => ({ assetRequests: [newReq, ...state.assetRequests] }));
    } catch (error) {
      throw error;
    }
  },

  updateAssetRequest: async (id, status) => {
    try {
      await updateDoc(doc(db, "asset_requests", id), { status });
      set((state) => ({
        assetRequests: state.assetRequests.map(r => r.id === id ? { ...r, status } : r)
      }));
    } catch (error) {
      throw error;
    }
  }

}));
