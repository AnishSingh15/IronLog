'use client';

import { AppHeader } from '@/components/AppHeader';
import { RestTimer } from '@/components/RestTimer';
import { useWeightUnit } from '@/contexts/WeightUnitContext';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/hooks/useTimer';
import apiClient, { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTimerStore } from '@/store/timer';
import { useWorkoutStore } from '@/store/workout';
import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FitnessCenter as FitnessCenterIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  TrendingUp as ProgressIcon,
  Scale as ScaleIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface SetInputs {
  weight: string;
  reps: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentWorkout,
    exercises,
    splitName,
    completionPercentage,
    isLoading: workoutLoading,
    setCurrentWorkout,
    setExercises,
    setSplitName,
    setCompletionPercentage,
    setLoading: setWorkoutLoading,
    updateSetRecord,
    markSetCompleted,
  } = useWorkoutStore();

  const { isRunning, timeElapsed, currentSet, setCurrentSet: setTimerCurrentSet } = useTimerStore();
  const { logout } = useAuth();
  const { startTimer, stopTimer, resetTimer, formatTime } = useTimer();

  const [setInputs, setSetInputs] = useState<Record<string, SetInputs>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Record<string, any[]>>({});
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [customSets, setCustomSets] = useState<Record<string, number>>({});
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimerFor, setRestTimerFor] = useState<string | null>(null);
  const [restTimerDefaultTime, setRestTimerDefaultTime] = useState(180); // 3 minutes default, but configurable
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Weight unit context
  const { useMetricSystem, toggleWeightUnit, formatWeightDisplay, getWeightUnit } = useWeightUnit();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load data sequentially to avoid race conditions
    const loadData = async () => {
      await loadTodaysWorkout();
      await loadExercises();
    };

    loadData();
  }, [isAuthenticated, router]);

  const loadTodaysWorkout = async () => {
    try {
      setWorkoutLoading(true);
      setError(null);
      setIsRestDay(false);

      const response = await api.get('/workouts/today');

      // Handle empty response (no workout today - let user choose)
      if (!response.success || !response.data) {
        setIsRestDay(false); // Don't automatically set rest day
        setCurrentWorkout(null);
        setCompletionPercentage(0);
        setSplitName(''); // Empty split name to show choice
        setSetInputs({});
        return;
      }

      const responseData = response.data as any;
      const {
        workoutDay,
        completionPercentage: completion,
        splitName: split,
      } = responseData.data || responseData;

      setCurrentWorkout(workoutDay);
      setCompletionPercentage(completion);
      setSplitName(split);

      // Initialize set inputs for incomplete sets
      const inputs: Record<string, SetInputs> = {};
      if (workoutDay.setRecords) {
        workoutDay.setRecords.forEach((set: any) => {
          if (!set.actualWeight || !set.actualReps) {
            inputs[set.id] = { weight: '', reps: '' };
          }
        });
      }
      setSetInputs(inputs);
    } catch (error: any) {
      // Handle expected 404 (no workout for today) - let user choose
      if (error.response?.status === 404) {
        // No workout for today - let user choose between workout and rest
        setCurrentWorkout(null);
        setIsRestDay(false);
        setCompletionPercentage(0);
        setSplitName('');
        setSetInputs({});
      } else if (error.response?.status === 204) {
        // Explicit rest day from server
        setIsRestDay(true);
        setCurrentWorkout(null);
        setCompletionPercentage(0);
        setSplitName('Rest Day');
        setSetInputs({});
      } else {
        // Log unexpected errors
        console.error("Failed to load today's workout:", error);
        setError("Failed to load today's workout. Please try again.");
      }
    } finally {
      setWorkoutLoading(false);
    }
  };

  const confirmDeleteWorkout = () => {
    setShowDeleteDialog(true);
  };

  const deleteWorkout = async () => {
    if (!currentWorkout) return;

    try {
      setWorkoutLoading(true);
      setError(null);
      setShowDeleteDialog(false);

      const response = await api.delete(`/workouts/${currentWorkout.id}`);

      if (response.success) {
        // Reset to initial state - show choice between workout and rest day
        setCurrentWorkout(null);
        setIsRestDay(false);
        setCompletionPercentage(0);
        setSplitName('');
        setSetInputs({});
        setExpandedExercise(false);
      } else {
        setError('Failed to delete workout. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to delete workout:', error);
      setError('Failed to delete workout. Please try again.');
    } finally {
      setWorkoutLoading(false);
    }
  };

  // Load available exercises
  const loadExercises = async () => {
    try {
      setIsLoadingExercises(true);
      const response = await api.get('/exercises');
      
      // Check if response is successful and has data
      if (response.success && response.data) {
        const responseData = response.data as any;
        
        // Handle the nested data structure properly
        if (responseData.exercisesByMuscleGroup) {
          setAvailableExercises(responseData.exercisesByMuscleGroup);
        } else if (responseData.data?.exercisesByMuscleGroup) {
          setAvailableExercises(responseData.data.exercisesByMuscleGroup);
        } else {
          console.warn('No exercisesByMuscleGroup found in response');
          setAvailableExercises({});
        }
      } else {
        console.error('Failed to load exercises - invalid response:', response);
        setError(`Failed to load exercises: ${response.error?.message || 'Unknown error'}`);
        setAvailableExercises({});
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setError('Failed to load exercises. Please try again.');
      setAvailableExercises({});
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const startWorkout = async (splitKey: 'CHEST_TRI' | 'BACK_BI' | 'LEGS_SHO') => {
    try {
      setIsStartingWorkout(true);
      setError(null);

      const response = await api.post('/workouts/start', { splitKey });
      const responseData = response.data as any;
      const {
        workoutDay,
        completionPercentage: completion,
        splitName: split,
      } = responseData.data || responseData;

      setCurrentWorkout(workoutDay);
      setCompletionPercentage(completion);
      setSplitName(split);

      // Initialize set inputs for incomplete sets
      const inputs: Record<string, SetInputs> = {};
      if (workoutDay.setRecords) {
        workoutDay.setRecords.forEach((set: any) => {
          if (!set.actualWeight || !set.actualReps) {
            inputs[set.id] = { weight: '', reps: '' };
          }
        });
      }
      setSetInputs(inputs);
      setShowWorkoutModal(false);
    } catch (error: any) {
      console.error('Failed to start workout:', error);
      setError('Failed to start workout. Please try again.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  // Create custom workout
  const createCustomWorkout = async () => {
    try {
      if (selectedExercises.length === 0) {
        setError('Please select at least one exercise.');
        return;
      }

      setIsStartingWorkout(true);
      setError(null);

      const response = await api.post('/workouts/custom', {
        exerciseIds: selectedExercises,
        customSets: Object.keys(customSets).length > 0 ? customSets : undefined,
      });

      const responseData = response.data as any;
      const {
        workoutDay,
        completionPercentage: completion,
        splitName: split,
      } = responseData.data || responseData;

      setCurrentWorkout(workoutDay);
      setCompletionPercentage(completion);
      setSplitName(split);

      // Initialize set inputs for incomplete sets
      const inputs: Record<string, SetInputs> = {};
      if (workoutDay.setRecords) {
        workoutDay.setRecords.forEach((set: any) => {
          if (!set.actualWeight || !set.actualReps) {
            inputs[set.id] = { weight: '', reps: '' };
          }
        });
      }
      setSetInputs(inputs);
      setShowWorkoutModal(false);
      setSelectedExercises([]);
      setCustomSets({});
    } catch (error: any) {
      console.error('Failed to create custom workout:', error);
      setError('Failed to create workout. Please try again.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  // Toggle exercise selection
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  // Update custom sets for an exercise
  const updateCustomSets = (exerciseId: string, sets: number) => {
    setCustomSets(prev => ({
      ...prev,
      [exerciseId]: sets,
    }));
  };

  const handleSetInputChange = (setId: string, field: 'weight' | 'reps', value: string) => {
    setSetInputs(prev => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value,
      },
    }));
  };

  const handleSetSubmit = async (setId: string) => {
    try {
      const inputs = setInputs[setId];
      if (!inputs || inputs.weight === '' || inputs.reps === '') {
        setError('Please enter both weight and reps values.');
        return;
      }

      // Validate inputs
      const weightValue = parseFloat(inputs.weight);
      const repsValue = parseInt(inputs.reps);

      // Check for invalid numbers
      if (isNaN(weightValue) || isNaN(repsValue)) {
        setError('Please enter valid numbers for weight and reps.');
        return;
      }

      if (weightValue < 0) {
        setError('Weight cannot be negative. Use 0 for bodyweight exercises.');
        return;
      }

      if (repsValue <= 0) {
        setError('Reps must be a positive number.');
        return;
      }

      setError(null);

      await api.patch(`/set-records/${setId}`, {
        actualWeight: weightValue,
        actualReps: repsValue,
      });

      // Find the set record to update
      const currentSetRecord = currentWorkout?.setRecords?.find(set => set.id === setId);
      if (currentSetRecord) {
        const updatedSetRecord = {
          ...currentSetRecord,
          actualWeight: weightValue,
          actualReps: repsValue,
          completed: true,
        };
        updateSetRecord(updatedSetRecord);
        markSetCompleted(currentSetRecord.exerciseId, currentSetRecord.setIndex);
      }

      // Remove from setInputs
      setSetInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[setId];
        return newInputs;
      });

      // Show rest timer after completing a set
      setRestTimerFor(setId);
      setShowRestTimer(true);

      // Update completion percentage and auto-complete if all sets done
      if (currentWorkout && currentWorkout.setRecords) {
        const totalSets = currentWorkout.setRecords.length;
        const completedSets = currentWorkout.setRecords.filter(
          set => set.id === setId || (set.actualWeight !== null && set.actualReps !== null)
        ).length;
        const newCompletion = Math.round((completedSets / totalSets) * 100);
        setCompletionPercentage(newCompletion);

        // Auto-complete workout if all sets are done
        if (newCompletion === 100) {
          setTimeout(() => {
            handleCompleteWorkout();
          }, 1500); // Wait 1.5 seconds to show the completion animation
        }
      }
    } catch (error: any) {
      console.error('Failed to update set:', error);
      setError('Failed to update set. Please try again.');
    }
  };

  const handleCompleteWorkout = async () => {
    if (!currentWorkout) return;

    try {
      await api.patch(`/workouts/${currentWorkout.id}/complete`);
      setError(null);
      // Reload the workout to reflect completion
      loadTodaysWorkout();
    } catch (error: any) {
      console.error('Failed to complete workout:', error);
      setError('Failed to complete workout. Please try again.');
    }
  };

  const handleMarkAllDone = async () => {
    if (!currentWorkout || !currentWorkout.setRecords) return;

    try {
      setError(null);

      // Get all incomplete sets
      const incompleteSets = currentWorkout.setRecords.filter(
        set => set.actualWeight === null || set.actualReps === null
      );

      // Mark each incomplete set with planned values or default values
      for (const set of incompleteSets) {
        const defaultWeight = set.plannedWeight || 0;
        const defaultReps = set.plannedReps || set.exercise.defaultReps;

        await api.patch(`/set-records/${set.id}`, {
          actualWeight: defaultWeight,
          actualReps: defaultReps,
        });

        // Update the local state
        const updatedSetRecord = {
          ...set,
          actualWeight: defaultWeight,
          actualReps: defaultReps,
          completed: true,
        };
        updateSetRecord(updatedSetRecord);
        markSetCompleted(set.exerciseId, set.setIndex);
      }

      // Update completion percentage
      setCompletionPercentage(100);

      // Auto-complete workout after a brief delay
      setTimeout(() => {
        handleCompleteWorkout();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to mark all sets as done:', error);
      setError('Failed to mark all sets as done. Please try again.');
    }
  };

  const handleStartSet = (setId: string) => {
    setTimerCurrentSet(setId);
    startTimer();
  };

  const handleAccordionChange =
    (exerciseId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedExercise(isExpanded ? exerciseId : false);
    };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    router.push('/login');
  };

  const handleRestTimerEnd = () => {
    // Timer finished, we can keep it visible or hide it
    console.log('Rest timer finished! 💪');
  };

  const handleCloseRestTimer = () => {
    setShowRestTimer(false);
    setRestTimerFor(null);
  };

  const renderTimerFab = () => {
    if (!currentSet) return null;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          onClick={isRunning ? stopTimer : resetTimer}
          sx={{
            width: 80,
            height: 80,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
          }}
        >
          <Box textAlign="center">
            {isRunning ? <PauseIcon /> : <TimerIcon />}
            <Typography variant="caption" display="block" fontSize="0.6rem">
              {formatTime(timeElapsed)}
            </Typography>
          </Box>
        </Fab>
      </motion.div>
    );
  };

  const renderWorkoutSummary = () => {
    if (!currentWorkout || !currentWorkout.setRecords) return null;

    const totalSets = currentWorkout.setRecords.length;
    const completedSets = currentWorkout.setRecords.filter(
      set => set.actualWeight !== null && set.actualReps !== null
    ).length;

    return (
      <motion.div variants={fadeInUp}>
        <Card
          sx={{
            mb: 3,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(244, 96, 54, 0.05) 0%, rgba(230, 108, 178, 0.05) 100%)',
            border: '1px solid rgba(244, 96, 54, 0.1)',
            boxShadow: '0 8px 32px rgba(244, 96, 54, 0.1)',
          }}
        >
          <CardContent>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                <FitnessCenterIcon sx={{ color: '#F46036' }} />
                Today's Workout
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={splitName}
                  sx={{
                    background: 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
                    color: '#EFE9E7',
                    fontWeight: 'bold',
                    border: 'none',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={confirmDeleteWorkout}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    },
                  }}
                  title="Delete Workout"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Progress: {completedSets}/{totalSets} sets completed ({completionPercentage}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.mode === 'dark' ? '#5A5A5A' : '#EAEEEA',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #3D9970 0%, #A3B18A 100%)',
                  },
                }}
              />
            </Box>

            {/* Mark All Done button - appears when there are incomplete sets */}
            {completionPercentage < 100 && !currentWorkout.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleMarkAllDone}
                  startIcon={<CheckIcon />}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Mark All Sets as Done
                </Button>
              </motion.div>
            )}

            {completionPercentage === 100 && !currentWorkout.completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCompleteWorkout}
                  startIcon={<CheckIcon />}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
                    color: '#EFE9E7',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(61, 153, 112, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2E7A5A 0%, #8FA074 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(61, 153, 112, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Complete Workout
                </Button>
              </motion.div>
            )}

            {currentWorkout.completed && (
              <motion.div {...fadeInUp}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  🎉 Workout completed! Great job!
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={async () => {
                    try {
                      // Unmark the workout as completed to allow adding more sets
                      await api.patch(`/workouts/${currentWorkout.id}/uncomplete`);

                      // Refresh the workout data
                      const updatedWorkout = await api.getTodayWorkout();
                      const updatedData = updatedWorkout.data as any;
                      setCurrentWorkout(updatedData.data || updatedData);

                      console.log('✅ Workout session restarted');
                    } catch (error) {
                      console.error('❌ Failed to restart workout:', error);
                      // Fallback: just mark as not completed locally
                      if (currentWorkout) {
                        setCurrentWorkout({ ...currentWorkout, completed: false });
                      }
                    }
                  }}
                  sx={{
                    height: 48,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  Continue Training
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderExercises = () => {
    if (!currentWorkout || !currentWorkout.setRecords) return null;

    // Group sets by exercise
    const exerciseGroups = currentWorkout.setRecords.reduce((acc: any, set: any) => {
      const exerciseId = set.exercise.id;
      if (!acc[exerciseId]) {
        acc[exerciseId] = {
          exercise: set.exercise,
          sets: [],
        };
      }
      acc[exerciseId].sets.push(set);
      return acc;
    }, {});

    return (
      <motion.div variants={staggerContainer}>
        {Object.entries(exerciseGroups).map(([exerciseId, group]: [string, any]) => (
          <motion.div key={exerciseId} variants={fadeInUp}>
            <Accordion
              expanded={expandedExercise === exerciseId}
              onChange={handleAccordionChange(exerciseId)}
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {group.exercise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.exercise.muscleGroup} • {group.sets.length} sets
                    </Typography>
                  </Box>
                  <Chip
                    label={`${group.sets.filter((s: any) => s.actualWeight !== null && s.actualReps !== null).length}/${group.sets.length}`}
                    size="small"
                    color={
                      group.sets.every((s: any) => s.actualWeight !== null && s.actualReps !== null)
                        ? 'success'
                        : 'default'
                    }
                    sx={{ mr: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {group.sets.map((set: any, index: number) => (
                    <Grid item xs={12} key={set.id}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            set.actualWeight !== null && set.actualReps !== null
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(52, 211, 153, 0.1)'
                                : 'rgba(16, 185, 129, 0.1)'
                              : theme.palette.background.default,
                          border:
                            set.actualWeight !== null && set.actualReps !== null
                              ? `1px solid ${theme.palette.success.main}`
                              : `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Set {index + 1}
                          </Typography>
                          {set.actualWeight !== null && set.actualReps !== null ? (
                            <Chip
                              icon={<CheckIcon />}
                              label="Completed"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PlayIcon />}
                              onClick={() => handleStartSet(set.id)}
                              disabled={currentSet === set.id && isRunning}
                            >
                              {currentSet === set.id && isRunning ? 'Active' : 'Start'}
                            </Button>
                          )}
                        </Box>

                        {set.actualWeight !== null && set.actualReps !== null ? (
                          <Box>
                            <Typography variant="body1">
                              <strong>{formatWeightDisplay(set.actualWeight)}</strong> ×{' '}
                              <strong>{set.actualReps} reps</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Target: {set.plannedReps} reps
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<TimerIcon />}
                              onClick={() => {
                                setRestTimerFor(set.id);
                                setShowRestTimer(true);
                              }}
                              sx={{ mt: 1 }}
                            >
                              Rest Timer
                            </Button>
                          </Box>
                        ) : (
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={4}>
                              <TextField
                                label={`Weight (${getWeightUnit()})`}
                                type="number"
                                value={setInputs[set.id]?.weight || ''}
                                onChange={e =>
                                  handleSetInputChange(set.id, 'weight', e.target.value)
                                }
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                label="Reps"
                                type="number"
                                value={setInputs[set.id]?.reps || ''}
                                onChange={e => handleSetInputChange(set.id, 'reps', e.target.value)}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <Button
                                variant="contained"
                                onClick={() => handleSetSubmit(set.id)}
                                disabled={
                                  !setInputs[set.id] ||
                                  setInputs[set.id]?.weight === '' ||
                                  setInputs[set.id]?.reps === ''
                                }
                                sx={{ width: '100%' }}
                              >
                                Log Set
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<TimerIcon />}
                                onClick={() => {
                                  setRestTimerFor(set.id);
                                  setShowRestTimer(true);
                                }}
                                sx={{ width: '100%', mt: 1 }}
                              >
                                Start Rest Timer
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderNavigationDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
              : 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
          color: theme.palette.mode === 'dark' ? '#fff' : 'white',
          boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
          🏋️ IronLog
        </Typography>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 2 }} />
      </Box>

      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              router.push('/history');
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <HistoryIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Workout History" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              router.push('/progress');
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <ProgressIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Progress & Analytics" />
          </ListItemButton>
        </ListItem>

        {!currentWorkout && !isRestDay && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setShowWorkoutModal(true);
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ListItemIcon>
                <FitnessCenterIcon sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Start Workout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 2 }} />

      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              // Profile menu functionality would go here
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mt: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: '#EFE9E7',
                  color: '#F46036',
                  fontWeight: 600,
                  width: 24,
                  height: 24,
                  fontSize: '0.8rem',
                }}
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={user?.email || 'User'}
              secondary="Profile & Settings"
              secondaryTypographyProps={{
                sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
              setDrawerOpen(false);
            }}
            data-testid="logout-button"
            sx={{
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              toggleWeightUnit();
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <ScaleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary={`Switch to ${useMetricSystem ? 'Pounds' : 'Kilograms'}`}
              secondary={`Currently: ${useMetricSystem ? 'kg' : 'lbs'}`}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 3, pb: 12 }}>
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {error && (
            <motion.div variants={fadeInUp}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {workoutLoading ? (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Loading your workout...
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ) : currentWorkout ? (
            <>
              {renderWorkoutSummary()}
              {renderExercises()}
            </>
          ) : isRestDay ? (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <FitnessCenterIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Rest Day
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Take a well-deserved break! Recovery is just as important as training.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <FitnessCenterIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h5" gutterBottom>
                    Ready to Start Your Workout?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    No workout scheduled for today. Create your custom workout by selecting
                    exercises!
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setShowWorkoutModal(true)}
                    startIcon={<FitnessCenterIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E55030 0%, #D45BA0 100%)',
                      },
                    }}
                  >
                    Start Workout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </Container>

      <AnimatePresence>{renderTimerFab()}</AnimatePresence>

      {/* Custom Workout Selection Modal */}
      <Dialog
        open={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
            color: 'white',
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            🏋️ Create Your Workout
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 1, opacity: 0.9 }}>
            Select exercises for today's session
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {isLoadingExercises ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Loading exercises...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {Object.entries(availableExercises).map(([muscleGroup, exercises]) => (
                <Box key={muscleGroup} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    💪 {muscleGroup}
                  </Typography>
                  <Grid container spacing={2}>
                    {exercises.map((exercise: any) => {
                      const isSelected = selectedExercises.includes(exercise.id);
                      const customSetCount = customSets[exercise.id] || exercise.defaultSets;

                      return (
                        <Grid item xs={12} sm={6} key={exercise.id}>
                          <Paper
                            onClick={() => toggleExerciseSelection(exercise.id)}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              backgroundColor: isSelected
                                ? 'rgba(255,255,255,0.3)'
                                : 'rgba(255,255,255,0.1)',
                              border: isSelected
                                ? '2px solid rgba(255,255,255,0.8)'
                                : '1px solid rgba(255,255,255,0.3)',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {exercise.name}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                  {exercise.defaultReps} reps × {customSetCount} sets
                                </Typography>
                              </Box>
                              {isSelected && <CheckIcon sx={{ color: 'white' }} />}
                            </Box>

                            {isSelected && (
                              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ minWidth: '40px' }}>
                                  Sets:
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={customSetCount}
                                  onChange={e =>
                                    updateCustomSets(
                                      exercise.id,
                                      parseInt(e.target.value) || exercise.defaultSets
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                  inputProps={{ min: 1, max: 10 }}
                                  sx={{
                                    width: '80px',
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.7)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                      },
                                    },
                                    '& .MuiInputBase-input': {
                                      color: 'white',
                                      textAlign: 'center',
                                    },
                                  }}
                                />
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
          {selectedExercises.length > 0 && (
            <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''}{' '}
              selected
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              onClick={() => setShowWorkoutModal(false)}
              disabled={isStartingWorkout}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' },
              }}
              variant="outlined"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={createCustomWorkout}
              disabled={isStartingWorkout || selectedExercises.length === 0}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {isStartingWorkout ? 'Creating Workout...' : 'Start Workout'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Navigation Drawer for Mobile */}
      {isMobile && renderNavigationDrawer()}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Workout?</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this workout? This action cannot be undone. You'll
            return to the main screen where you can choose to start a new workout or take a rest
            day.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={deleteWorkout} color="error" variant="contained">
            Delete Workout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rest Timer */}
      <RestTimer
        isVisible={showRestTimer}
        onTimerEnd={handleRestTimerEnd}
        defaultTime={restTimerDefaultTime}
        onClose={handleCloseRestTimer}
      />

      {/* Rest Timer Overlay */}
      {showRestTimer && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2,
          }}
          onClick={handleCloseRestTimer}
        >
          <Box onClick={e => e.stopPropagation()}>
            <RestTimer
              isVisible={showRestTimer}
              onTimerEnd={handleRestTimerEnd}
              onClose={handleCloseRestTimer}
              defaultTime={180} // 3 minutes default
            />
          </Box>
        </Box>
      )}

      {/* Quick Rest Timer FAB */}
      {currentWorkout && !showRestTimer && (
        <Fab
          color="primary"
          aria-label="rest timer"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => {
            setRestTimerFor('quick-timer');
            setShowRestTimer(true);
          }}
        >
          <TimerIcon />
        </Fab>
      )}
    </Box>
    </>
  );
}
