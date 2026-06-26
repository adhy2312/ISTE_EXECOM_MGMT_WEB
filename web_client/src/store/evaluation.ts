import { create } from 'zustand';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cleanPayload } from '@/utils/helpers';
import { EvaluationScore, ContributionEntry, ContributionStatus } from '@/types/models';

interface EvaluationStore {
  myEvaluation: EvaluationScore | null;
  myContributions: ContributionEntry[];
  allEvaluations: Record<string, EvaluationScore>;
  allContributions: Record<string, ContributionEntry[]>;
  isLoading: boolean;
  error: string | null;

  // Member actions
  fetchMyEvaluation: (memberId: string) => Promise<void>;
  fetchMyContributions: (memberId: string) => Promise<void>;
  submitContribution: (memberId: string, data: Pick<ContributionEntry, 'date' | 'task' | 'proofUrl'>) => Promise<void>;

  // Admin actions
  fetchAllEvaluations: () => Promise<void>;
  fetchMemberContributions: (memberId: string) => Promise<void>;
  updateEvaluation: (
    memberId: string,
    scores: Partial<Pick<EvaluationScore, 'departmentScore' | 'initiativeScore' | 'reliabilityScore' | 'attendanceScore' | 'eventAllocations'>>,
    adminId: string
  ) => Promise<void>;
  updateContributionStatus: (memberId: string, entryId: string, status: ContributionStatus, note?: string) => Promise<void>;
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  myEvaluation: null,
  myContributions: [],
  allEvaluations: {},
  allContributions: {},
  isLoading: false,
  error: null,

  fetchMyEvaluation: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const snap = await getDoc(doc(db, 'evaluations', memberId));
      set({ myEvaluation: snap.exists() ? (snap.data() as EvaluationScore) : null, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchMyContributions: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'contributionLog', memberId, 'entries'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const contributions = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContributionEntry));
      set({ myContributions: contributions, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  submitContribution: async (memberId, data) => {
    set({ isLoading: true, error: null });
    try {
      const entry = cleanPayload({
        ...data,
        memberId,
        submittedAt: new Date().toISOString(),
        status: 'pending' as ContributionStatus,
      });
      await addDoc(collection(db, 'contributionLog', memberId, 'entries'), entry);
      await get().fetchMyContributions(memberId);
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  fetchAllEvaluations: async () => {
    set({ isLoading: true, error: null });
    try {
      const snap = await getDocs(collection(db, 'evaluations'));
      const evals: Record<string, EvaluationScore> = {};
      snap.docs.forEach(d => { evals[d.id] = d.data() as EvaluationScore; });
      set({ allEvaluations: evals, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchMemberContributions: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(db, 'contributionLog', memberId, 'entries'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const contributions = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContributionEntry));
      set(state => ({
        allContributions: { ...state.allContributions, [memberId]: contributions },
        isLoading: false,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updateEvaluation: async (memberId, scores, adminId) => {
    set({ isLoading: true, error: null });
    try {
      const currentSnap = await getDoc(doc(db, 'evaluations', memberId));
      const base = currentSnap.exists() ? (currentSnap.data() as EvaluationScore) : {
        memberId,
        departmentScore: 0,
        initiativeScore: 0,
        reliabilityScore: 0,
        attendanceScore: 0,
      };

      const merged = { ...base, ...scores };
      
      const eventPoints = (merged.eventAllocations || []).reduce((sum, ev) => sum + ev.points, 0);

      const totalScore =
        (merged.departmentScore || 0) +
        (merged.initiativeScore || 0) +
        (merged.reliabilityScore || 0) +
        (merged.attendanceScore || 0) +
        eventPoints;

      const evalDoc: EvaluationScore = {
        memberId,
        departmentScore: merged.departmentScore || 0,
        initiativeScore: merged.initiativeScore || 0,
        reliabilityScore: merged.reliabilityScore || 0,
        attendanceScore: merged.attendanceScore || 0,
        eventAllocations: merged.eventAllocations || [],
        totalScore,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminId,
      };

      await setDoc(doc(db, 'evaluations', memberId), evalDoc);

      set(state => ({
        allEvaluations: { ...state.allEvaluations, [memberId]: evalDoc },
        myEvaluation: state.myEvaluation?.memberId === memberId ? evalDoc : state.myEvaluation,
        isLoading: false,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  updateContributionStatus: async (memberId, entryId, status, note) => {
    set({ isLoading: true, error: null });
    try {
      await updateDoc(
        doc(db, 'contributionLog', memberId, 'entries', entryId),
        { status, adminNote: note ?? '' }
      );
      await get().fetchMemberContributions(memberId);
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },
}));
