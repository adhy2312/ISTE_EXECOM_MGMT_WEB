import { create } from 'zustand';

export interface DashboardEvent {
  id: string;
  title: string;
  date: string;
  type: 'Symposium' | 'Meeting' | 'Workshop';
  location: string;
}

export interface DashboardActivity {
  id: string;
  user: string;
  action: string;
  time: string;
}

interface DashboardState {
  events: DashboardEvent[];
  activities: DashboardActivity[];
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

const MOCK_EVENTS: DashboardEvent[] = [
  { id: 'e1', title: 'Tech Symposia 2026', date: new Date(Date.now() + 86400000 * 3).toISOString(), type: 'Symposium', location: 'Main Auditorium' },
  { id: 'e2', title: 'ExeCom Core Sync', date: new Date(Date.now() + 86400000 * 1).toISOString(), type: 'Meeting', location: 'Room 402' },
];

const MOCK_ACTIVITIES: DashboardActivity[] = [
  { id: 'a1', user: 'Elena G', action: 'uploaded Design Assets', time: '10m ago' },
  { id: 'a2', user: 'Rahul K', action: 'completed Task "API Auth"', time: '1h ago' },
  { id: 'a3', user: 'Admin User', action: 'scheduled ExeCom Sync', time: '3h ago' },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  events: [],
  activities: [],
  isLoading: false,
  fetchDashboardData: async () => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 700));
    set({ events: MOCK_EVENTS, activities: MOCK_ACTIVITIES, isLoading: false });
  }
}));
