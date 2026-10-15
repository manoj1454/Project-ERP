import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ActiveTimer {
  taskId: string | null;
  taskName: string | null;
  projectName: string | null;
  startTime: number | null; // timestamp in ms
  elapsedSeconds: number;
  isRunning: boolean;
  isBillable: boolean;
  isSaveModalOpen: boolean;
  stoppedDurationSeconds: number;
}

interface TimerStore extends ActiveTimer {
  startTimer: (taskId: string, taskName: string, projectName: string, isBillable?: boolean) => void;
  stopTimer: () => void;
  tick: () => void;
  resetTimer: () => void;
  setIsBillable: (billable: boolean) => void;
  closeSaveModal: () => void;
  openSaveModal: () => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      taskId: null,
      taskName: null,
      projectName: null,
      startTime: null,
      elapsedSeconds: 0,
      isRunning: false,
      isBillable: true,
      isSaveModalOpen: false,
      stoppedDurationSeconds: 0,

      startTimer: (taskId, taskName, projectName, isBillable = true) => {
        const now = Date.now();
        set({
          taskId,
          taskName,
          projectName,
          startTime: now,
          elapsedSeconds: 0,
          isRunning: true,
          isBillable,
          isSaveModalOpen: false,
          stoppedDurationSeconds: 0,
        });
      },

      stopTimer: () => {
        const state = get();
        const duration = state.startTime
          ? Math.max(1, Math.floor((Date.now() - state.startTime) / 1000))
          : state.elapsedSeconds;

        set({
          isRunning: false,
          stoppedDurationSeconds: duration,
          isSaveModalOpen: true, // Prompt for notes and logging automatically!
        });
      },

      tick: () => {
        const state = get();
        if (state.isRunning && state.startTime) {
          const calculated = Math.floor((Date.now() - state.startTime) / 1000);
          set({ elapsedSeconds: calculated });
        }
      },

      resetTimer: () =>
        set({
          taskId: null,
          taskName: null,
          projectName: null,
          startTime: null,
          elapsedSeconds: 0,
          isRunning: false,
          isBillable: true,
          isSaveModalOpen: false,
          stoppedDurationSeconds: 0,
        }),

      setIsBillable: (isBillable: boolean) => set({ isBillable }),

      closeSaveModal: () => set({ isSaveModalOpen: false }),

      openSaveModal: () => set({ isSaveModalOpen: true }),
    }),
    {
      name: "workspace-erp-active-timer",
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          return localStorage.getItem(name);
        },
        setItem: (name: string, value: string) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name: string) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      })),
      partialize: (state) => ({
        taskId: state.taskId,
        taskName: state.taskName,
        projectName: state.projectName,
        startTime: state.startTime,
        elapsedSeconds: state.elapsedSeconds,
        isRunning: state.isRunning,
        isBillable: state.isBillable,
        isSaveModalOpen: state.isSaveModalOpen,
        stoppedDurationSeconds: state.stoppedDurationSeconds,
      }),
    }
  )
);
