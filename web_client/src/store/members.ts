import { create } from 'zustand';
import { ExecomMember, Team } from '@/types/models';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface MembersState {
  members: ExecomMember[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  fetchTeams: () => void;

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

  fetchTeams: () => {
    set({
      teams: [
        { id: "core", name: "Core Team", description: "Mentors, Faculty, Chair, Vice Chair, Secretary, Treasurer", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "pr_media", name: "PR & Media Team", description: "Public Relations and Media Management", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "content_doc", name: "Content & Documentation Team", description: "Content Strategy and Records", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "design", name: "Design Team", description: "UI/UX, Graphics, and Branding", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "event_mgmt", name: "Event Management Team", description: "Planning and Execution of Events", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "she", name: "SHE Team", description: "Safety, Health, and Environment", leaderId: null, memberIds: [], createdAt: new Date().toISOString() },
        { id: "internship", name: "Internship Launchpad Team", description: "Career and Internship Opportunities", leaderId: null, memberIds: [], createdAt: new Date().toISOString() }
      ],
      isLoading: false
    });
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
