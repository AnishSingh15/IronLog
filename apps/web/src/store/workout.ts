import { create } from 'zustand';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

interface SetRecord {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  setIndex: number;
  plannedWeight?: number;
  plannedReps?: number;
  actualWeight?: number;
  actualReps?: number;
  secondsRest?: number;
  exercise: Exercise;
  completed: boolean;
}

interface WorkoutDay {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  setRecords: SetRecord[];
}

interface WorkoutState {
  currentWorkout: WorkoutDay | null;
  exercises: Exercise[];
  splitName: string;
  completionPercentage: number;
  isLoading: boolean;
  setCurrentWorkout: (workout: WorkoutDay | null) => void;
  setExercises: (exercises: Exercise[]) => void;
  setSplitName: (splitName: string) => void;
  setCompletionPercentage: (percentage: number) => void;
  setLoading: (loading: boolean) => void;
  updateSetRecord: (setRecord: SetRecord) => void;
  markSetCompleted: (exerciseId: string, setIndex: number) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  currentWorkout: null,
  exercises: [],
  splitName: '',
  completionPercentage: 0,
  isLoading: false,

  setCurrentWorkout: workout => set({ currentWorkout: workout }),
  setExercises: exercises => set({ exercises }),
  setSplitName: splitName => set({ splitName }),
  setCompletionPercentage: completionPercentage => set({ completionPercentage }),
  setLoading: isLoading => set({ isLoading }),

  updateSetRecord: updatedSetRecord => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const updatedSetRecords = currentWorkout.setRecords.map(setRecord =>
      setRecord.id === updatedSetRecord.id ? updatedSetRecord : setRecord
    );

    const updatedWorkout = {
      ...currentWorkout,
      setRecords: updatedSetRecords,
    };

    set({ currentWorkout: updatedWorkout });
  },

  markSetCompleted: (exerciseId, setIndex) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const updatedSetRecords = currentWorkout.setRecords.map(setRecord =>
      setRecord.exerciseId === exerciseId && setRecord.setIndex === setIndex
        ? { ...setRecord, completed: true }
        : setRecord
    );

    const updatedWorkout = {
      ...currentWorkout,
      setRecords: updatedSetRecords,
    };

    // Calculate new completion percentage
    const totalSets = updatedSetRecords.length;
    const completedSets = updatedSetRecords.filter(set => set.completed).length;
    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    set({
      currentWorkout: updatedWorkout,
      completionPercentage,
    });
  },
}));
