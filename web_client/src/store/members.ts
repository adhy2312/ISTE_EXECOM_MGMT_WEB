import { create } from 'zustand';
import { ExecomMember, Team } from '@/types/models';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface MembersState {
  members: ExecomMember[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string, description: string, leaderId?: string | null) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updateMemberProfile: (uid: string, updates: Partial<ExecomMember>) => Promise<void>;
  uploadProfilePicture: (uid: string, file: File) => Promise<string>;
}

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  teams: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const snap = await getDocs(collection(db, 'users'));
      const members = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ExecomMember))
        .filter(m => !!m.fullName)
        .sort((a, b) => b.corePoints - a.corePoints);
      set({ members, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const snap = await getDocs(collection(db, 'teams'));
      const teams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Team));
      set({ teams, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createTeam: async (name, description, leaderId = null) => {
    set({ isLoading: true, error: null });
    try {
      const newTeam = {
        name, description, leaderId, memberIds: [] as string[], createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'teams'), newTeam);
      set(state => ({ teams: [...state.teams, { id: docRef.id, ...newTeam } as Team], isLoading: false }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  deleteTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'teams', teamId));
      set(state => ({ teams: state.teams.filter(t => t.id !== teamId), isLoading: false }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  updateMemberProfile: async (uid, updates) => {
    set({ isLoading: true, error: null });
    try {
      await updateDoc(doc(db, 'users', uid), updates as Record<string, unknown>);
      set(state => ({
        members: state.members.map(m => m.id === uid ? { ...m, ...updates } : m),
        isLoading: false,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  uploadProfilePicture: async (uid, file) => {
    set({ isLoading: true, error: null });
    try {
      const storageRef = ref(storage, `profiles/${uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', uid), { photoURL });
      set(state => ({
        members: state.members.map(m => m.id === uid ? { ...m, photoURL } : m),
        isLoading: false,
      }));
      return photoURL;
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },
}));
