import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  timeElapsed: number; // in seconds
  defaultTime: number; // in seconds
  startTime: number | null;
  currentSet: string | null; // setRecord ID
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDefaultTime: (time: number) => void;
  setCurrentSet: (setId: string | null) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  timeRemaining: 90, // Default 90 seconds
  timeElapsed: 0,
  defaultTime: 90,
  startTime: null,
  currentSet: null,

  startTimer: (duration = get().defaultTime) => {
    set({
      isRunning: true,
      timeRemaining: duration,
      startTime: Date.now(),
      timeElapsed: 0,
    });
  },

  pauseTimer: () => {
    set({ isRunning: false, startTime: null });
  },

  resetTimer: () => {
    const { defaultTime } = get();
    set({
      isRunning: false,
      timeRemaining: defaultTime,
      timeElapsed: 0,
      startTime: null,
    });
  },

  setDefaultTime: (time: number) => {
    set({
      defaultTime: time,
      timeRemaining: get().isRunning ? get().timeRemaining : time,
    });
  },

  setCurrentSet: (setId: string | null) => {
    set({ currentSet: setId });
  },

  tick: () => {
    const { timeRemaining, timeElapsed, isRunning } = get();
    if (isRunning && timeRemaining > 0) {
      set({
        timeRemaining: timeRemaining - 1,
        timeElapsed: timeElapsed + 1,
      });
    } else if (timeRemaining <= 0) {
      set({ isRunning: false });
      // Trigger notification or vibration here
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      // You can also trigger a sound or push notification here
    }
  },
}));
