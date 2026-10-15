import { create } from "zustand";

export interface SentientNotificationItem {
  id: string;
  title: string;
  message: string;
  type?: "phase_completed" | "task_done" | "payment" | "info";
  timestamp: number;
}

interface NotificationState {
  notifications: SentientNotificationItem[];
  notify: (
    title: string,
    message: string,
    type?: "phase_completed" | "task_done" | "payment" | "info"
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notify: (title, message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => ({
      notifications: [...state.notifications, { id, title, message, type, timestamp: Date.now() }],
    }));
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
