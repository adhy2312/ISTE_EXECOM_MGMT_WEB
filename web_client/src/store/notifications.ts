import { create } from 'zustand';
import {
  collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  updateDoc, doc, arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppNotification } from '@/types/models';

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  subscribeToNotifications: (userId: string) => () => void;
  markAllRead: (userId: string) => Promise<void>;
  createAnnouncement: (title: string, body: string, type: AppNotification['type']) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,

  subscribeToNotifications: (userId: string) => {
    set({ isLoading: true });
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsub = onSnapshot(q, (snap) => {
      const notifs: AppNotification[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as AppNotification));
      const unreadCount = notifs.filter(n => !n.readBy?.includes(userId)).length;
      set({ notifications: notifs, unreadCount, isLoading: false });
    }, () => {
      set({ isLoading: false });
    });
    return unsub;
  },

  markAllRead: async (userId: string) => {
    const { notifications } = get();
    const unread = notifications.filter(n => !n.readBy?.includes(userId));
    await Promise.all(
      unread.map(n => updateDoc(doc(db, 'notifications', n.id), { readBy: arrayUnion(userId) }))
    );
  },

  createAnnouncement: async (title: string, body: string, type: AppNotification['type']) => {
    await addDoc(collection(db, 'notifications'), {
      title,
      body,
      type,
      createdAt: serverTimestamp(),
      readBy: [],
    });
  },
}));
