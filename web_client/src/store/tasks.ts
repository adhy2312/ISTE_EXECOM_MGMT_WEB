import { create } from 'zustand';
import { TaskItem, TaskState, TaskPriority } from '@/types/models';

interface TasksStore {
  tasks: TaskItem[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  updateTaskState: (id: string, newState: TaskState) => void;
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Finalize Tech Symposia Rules',
    description: 'Draft the rulebook for the upcoming Tech Symposia hackathon.',
    creatorId: '1',
    assignedMemberId: '3',
    teamId: 'event_mgmt',
    targetDeadline: new Date(Date.now() + 86400000).toISOString(),
    potentialPoints: 50,
    state: TaskState.inProgress,
    priority: TaskPriority.high,
    progressPercentage: 60,
    comments: [],
    attachmentUrls: []
  },
  {
    id: 't2',
    title: 'Design IG Posters',
    description: 'Create 3 posters for the Instagram campaign for the Symposia.',
    creatorId: '1',
    assignedMemberId: '2',
    teamId: 'design',
    targetDeadline: new Date(Date.now() + 172800000).toISOString(),
    potentialPoints: 30,
    state: TaskState.pending,
    priority: TaskPriority.medium,
    progressPercentage: 0,
    comments: [],
    attachmentUrls: []
  }
];

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  isLoading: false,
  fetchTasks: async () => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 600));
    set({ tasks: MOCK_TASKS, isLoading: false });
  },
  updateTaskState: (id, newState) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, state: newState } : t)
  }))
}));
