import { useTimerStore } from '@/store/timer';
import { useEffect, useRef } from 'react';

export function useTimer() {
  const {
    isRunning,
    timeRemaining,
    timeElapsed,
    defaultTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setDefaultTime,
    tick,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tick]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((defaultTime - timeRemaining) / defaultTime) * 100;
  };

  return {
    isRunning,
    timeRemaining,
    timeElapsed,
    defaultTime,
    formattedTime: formatTime(timeRemaining),
    progressPercentage: getProgressPercentage(),
    startTimer,
    pauseTimer,
    stopTimer: pauseTimer, // Alias for consistency
    resetTimer,
    setDefaultTime,
    formatTime,
  };
}
