'use client';

import { api } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseFormData {
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

export interface ExerciseFilters {
  search?: string;
  muscleGroup?: string;
}

export function useExercises(filters: ExerciseFilters = {}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getExercises({
        search: filters.search || undefined,
        muscleGroup: filters.muscleGroup || undefined,
      });

      if (response.success && response.data) {
        setExercises(response.data.exercises || []);
      } else {
        setError(response.error?.message || 'Failed to fetch exercises');
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError('Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.muscleGroup]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const createExercise = async (
    exerciseData: ExerciseFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.createExercise(exerciseData);

      if (response.success) {
        await fetchExercises(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: response.error?.message || 'Failed to create exercise' };
      }
    } catch (err) {
      console.error('Error creating exercise:', err);
      return { success: false, error: 'Failed to create exercise' };
    }
  };

  const updateExercise = async (
    id: string,
    exerciseData: Partial<ExerciseFormData>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.updateExercise(id, exerciseData);

      if (response.success) {
        await fetchExercises(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: response.error?.message || 'Failed to update exercise' };
      }
    } catch (err) {
      console.error('Error updating exercise:', err);
      return { success: false, error: 'Failed to update exercise' };
    }
  };

  const deleteExercise = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.deleteExercise(id);

      if (response.success) {
        await fetchExercises(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: response.error?.message || 'Failed to delete exercise' };
      }
    } catch (err) {
      console.error('Error deleting exercise:', err);
      return { success: false, error: 'Failed to delete exercise' };
    }
  };

  const refresh = () => {
    fetchExercises();
  };

  return {
    exercises,
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    refresh,
  };
}

export function usePopularExercises(limit: number = 10) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularExercises = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getPopularExercises(limit);

        if (response.success && response.data) {
          setExercises(response.data.exercises || []);
        } else {
          setError(response.error?.message || 'Failed to fetch popular exercises');
        }
      } catch (err) {
        console.error('Error fetching popular exercises:', err);
        setError('Failed to fetch popular exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularExercises();
  }, [limit]);

  return {
    exercises,
    loading,
    error,
  };
}
