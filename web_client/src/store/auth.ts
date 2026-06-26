import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '@/lib/firebase';
import { ExecomMember, UserRole, UserStatus, ROOT_ADMINS } from '@/types/models';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AuthState {
  user: ExecomMember | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
  updateProfilePicture: (file: File) => Promise<string | null>;
}

/** Look up the allowedUsers whitelist — returns the entry or null if blocked */
async function getWhitelistEntry(email: string) {
  const key = email.toLowerCase().trim();

  // 👑 Root Admin Bypass — guarantees the owner is never locked out
  if (ROOT_ADMINS.includes(key)) {
    return {
      email: key,
      role: UserRole.chapterAdmin,
      designation: 'PR Head', // We could map this to a specific string based on email, but this works to allow access.
      isActive: true,
    };
  }

  const snap = await getDoc(doc(db, 'allowedUsers', key));
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.isActive !== false ? data : null; // null = blocked
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  error: null,

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // We rely purely on the whitelist check below to restrict access.
        set({ firebaseUser, isLoading: true });

        try {
          // 2. Whitelist check — only provisioned accounts can enter
          const whitelist = await getWhitelistEntry(firebaseUser.email!);
          if (!whitelist) {
            await signOut(auth);
            set({
              user: null, firebaseUser: null, isLoading: false,
              error: 'Your account has not been provisioned. Contact the PR Head to gain access.',
            });
            return;
          }

          // 3. Load or create Firestore profile, syncing role from whitelist
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userSnap.exists()) {
            const existing = userSnap.data() as ExecomMember;
            // Sync role if admin changed it in whitelist
            if (existing.role !== whitelist.role || existing.designation !== whitelist.designation) {
              await setDoc(doc(db, 'users', firebaseUser.uid),
                { role: whitelist.role, designation: whitelist.designation },
                { merge: true }
              );
            }
            set({
              user: { ...existing, id: userSnap.id, role: whitelist.role, designation: whitelist.designation },
              isLoading: false,
            });
          } else {
            // Auto-create profile on first login using whitelist role
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newUser: any = {
              id: firebaseUser.uid,
              fullName: whitelist.fullName || firebaseUser.displayName || 'New Member',
              email: firebaseUser.email ?? '',
              branchBatch: whitelist.branchBatch || '',
              department: whitelist.department || '',
              contact: '',
              skills: [],
              areasOfExpertise: '',
              socialLinks: {},
              role: whitelist.role as UserRole,
              designation: whitelist.designation ?? 'Member',
              activeStatus: UserStatus.active,
              corePoints: 0,
            };
            
            if (whitelist.teamId) {
              newUser.teamId = whitelist.teamId;
            }

            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            set({ user: newUser as ExecomMember, isLoading: false });
          }
        } catch (e: unknown) {
          set({ error: (e as Error).message, isLoading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, isLoading: false });
      }
    });
    return unsubscribe;
  },

  loginWithEmail: async (email, password, rememberMe = false) => {
    set({ error: null, isLoading: true });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.message;
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  loginWithGoogle: async (rememberMe = false) => {
    set({ error: null, isLoading: true });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      if (err.code !== 'auth/popup-closed-by-user') {
        set({ error: err.message, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      throw e;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, firebaseUser: null, error: null });
  },

  updateProfilePicture: async (file: File) => {
    const state = useAuthStore.getState();
    if (!state.firebaseUser || !state.user) throw new Error("Not authenticated");
    
    set({ isLoading: true, error: null });
    try {
      const fileRef = ref(storage, `profile_pictures/${state.firebaseUser.uid}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      // Update firestore document
      await setDoc(doc(db, 'users', state.firebaseUser.uid), { photoURL: url }, { merge: true });
      
      // Update local state
      set({ 
        user: { ...state.user, photoURL: url },
        isLoading: false 
      });
      return url;
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      return null;
    }
  },
}));
