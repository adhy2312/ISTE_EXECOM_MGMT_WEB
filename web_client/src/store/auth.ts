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
import { auth, db } from '@/lib/firebase';
import { ExecomMember, UserRole, UserStatus } from '@/types/models';

const ALLOWED_DOMAIN = 'mbcet.ac.in';

const isDomainAllowed = (email: string | null) =>
  !!email && email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);

interface AuthState {
  user: ExecomMember | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
}

/** Look up the allowedUsers whitelist — returns the entry or null if blocked */
async function getWhitelistEntry(email: string) {
  const key = email.toLowerCase().trim();

  // 👑 Root Admin Bypass — guarantees the owner is never locked out
  if (key === 'adhithyamohans.b24ec1205@mbcet.ac.in') {
    return {
      email: key,
      role: UserRole.chapterAdmin,
      designation: 'Chairperson',
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
        // 1. Domain check
        if (!isDomainAllowed(firebaseUser.email)) {
          await signOut(auth);
          set({ user: null, firebaseUser: null, isLoading: false, error: 'Access restricted to @mbcet.ac.in accounts only.' });
          return;
        }
        set({ firebaseUser, isLoading: true });

        try {
          // 2. Whitelist check — only provisioned accounts can enter
          const whitelist = await getWhitelistEntry(firebaseUser.email!);
          if (!whitelist) {
            await signOut(auth);
            set({
              user: null, firebaseUser: null, isLoading: false,
              error: 'Your account has not been provisioned. Contact the Chairperson to gain access.',
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
            const newUser: ExecomMember = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName ?? 'New Member',
              email: firebaseUser.email ?? '',
              branchBatch: '',
              department: '',
              contact: '',
              skills: [],
              areasOfExpertise: '',
              socialLinks: {},
              role: whitelist.role as UserRole,
              designation: whitelist.designation ?? 'Member',
              activeStatus: UserStatus.active,
              corePoints: 0,
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            set({ user: newUser, isLoading: false });
          }
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, isLoading: false });
      }
    });
    return unsubscribe;
  },

  loginWithEmail: async (email, password, rememberMe = false) => {
    set({ error: null });
    if (!isDomainAllowed(email)) {
      set({ error: 'Only @mbcet.ac.in email addresses are allowed.' });
      throw new Error('Domain not allowed');
    }
    set({ isLoading: true });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const msg =
        e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : e.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : e.message;
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  loginWithGoogle: async (rememberMe = false) => {
    set({ error: null, isLoading: true });
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ hd: ALLOWED_DOMAIN });
      const result = await signInWithPopup(auth, provider);
      if (!isDomainAllowed(result.user.email)) {
        await signOut(auth);
        set({ error: 'Only @mbcet.ac.in accounts are permitted.', isLoading: false });
        throw new Error('Domain not allowed');
      }
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        set({ error: e.message, isLoading: false });
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
}));
