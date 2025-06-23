'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Dashboard as DashboardIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as FitnessCenterIcon,
  Menu as MenuIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
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
  actualWeight: number | null;
  actualReps: number | null;
  secondsRest?: number;
  exercise: {
    name: string;
    muscleGroup: string;
  };
}

interface WorkoutDay {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  completionPercentage: number;
  splitName: string;
  setRecords: SetRecord[];
}

interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  totalSets: number;
  averageCompletion: number;
}

interface SetInputs {
  weight: string;
  reps: string;
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  totalSetsCompleted: number;
  personalRecords: number;
  recentActivity: Array<{
    date: string;
    completed: boolean;
  }>;
}

export default function HistoryPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWorkoutHistory();
    loadWorkoutStats();
  }, [isAuthenticated, router, currentMonth]);

  const loadWorkoutHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const response = await apiClient.get(
        `/workouts/history?startDate=${startDate}&endDate=${endDate}`
      );
      setWorkoutDays(response.data.data || response.data);
    } catch (error: any) {
      console.error('Failed to load workout history:', error);
      setError('Failed to load workout history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkoutStats = async () => {
    try {
      const response = await apiClient.get('/workouts/stats');
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load workout stats:', error);
    }
  };

  const getWorkoutForDate = (date: Date): WorkoutDay | undefined => {
    return workoutDays.find(workout => isSameDay(new Date(workout.date), date));
  };

  const getIntensityColor = (workout: WorkoutDay | undefined): string => {
    if (!workout || !workout.setRecords?.length) return 'transparent';

    const completionRate = workout.completionPercentage / 100;

    if (completionRate === 0) return theme.palette.mode === 'dark' ? '#4A4A4A' : '#EAEEEA';
    if (completionRate <= 0.25)
      return theme.palette.mode === 'dark'
        ? 'rgba(163, 177, 138, 0.3)'
        : 'rgba(163, 177, 138, 0.2)';
    if (completionRate <= 0.5)
      return theme.palette.mode === 'dark'
        ? 'rgba(163, 177, 138, 0.5)'
        : 'rgba(163, 177, 138, 0.4)';
    if (completionRate <= 0.75)
      return theme.palette.mode === 'dark' ? 'rgba(61, 153, 112, 0.7)' : 'rgba(61, 153, 112, 0.6)';
    return theme.palette.mode === 'dark' ? '#3D9970' : '#3D9970';
  };

  const handleDayClick = (date: Date) => {
    const workout = getWorkoutForDate(date);
    setSelectedDay(workout || null);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    const statsData = [
      {
        title: 'Total Workouts',
        value: stats.totalWorkouts,
        icon: <FitnessCenterIcon />,
        color: '#F46036',
      },
      {
        title: 'Current Streak',
        value: `${stats.currentStreak} days`,
        icon: <FireIcon />,
        color: '#E66CB2',
      },
      {
        title: 'Sets Completed',
        value: stats.totalSetsCompleted,
        icon: <TrendingUpIcon />,
        color: '#3D9970',
      },
      {
        title: 'Personal Records',
        value: stats.personalRecords,
        icon: <TimelineIcon />,
        color: '#A3B18A',
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={6} sm={3} key={stat.title}>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(62, 62, 62, 0.8) 0%, rgba(74, 74, 74, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 233, 231, 0.8) 0%, rgba(234, 238, 234, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid rgba(244, 96, 54, 0.1)`,
                  boxShadow: '0 8px 32px rgba(244, 96, 54, 0.05)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-out',
                    boxShadow: '0 12px 40px rgba(244, 96, 54, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      mb: 1,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCalendarHeatmap = () => {
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Add empty cells for the first week to align with the correct day
    const firstDayOfWeek = startDate.getDay();
    const emptyCells = Array(firstDayOfWeek).fill(null);

    const allCells = [...emptyCells, ...days];

    return (
      <Card
        sx={{
          mb: 4,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgba(163, 177, 138, 0.05) 0%, rgba(61, 153, 112, 0.05) 100%)',
          border: '1px solid rgba(163, 177, 138, 0.2)',
          boxShadow: '0 8px 32px rgba(163, 177, 138, 0.1)',
        }}
      >
        <CardContent>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <CalendarIcon sx={{ color: '#3D9970' }} />
              Workout Calendar
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePreviousMonth} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h6"
                fontWeight="medium"
                sx={{ minWidth: 140, textAlign: 'center' }}
              >
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small">
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={0.5}>
            {/* Day labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}

            {/* Calendar cells */}
            {allCells.map((date, index) => {
              if (!date) {
                return <Grid item xs={12 / 7} key={`empty-${index}`} sx={{ height: 40 }} />;
              }

              const workout = getWorkoutForDate(date);
              const intensity = getIntensityColor(workout);
              const isCurrentDay = isToday(date);

              return (
                <Grid item xs={12 / 7} key={date.toISOString()}>
                  <Tooltip
                    title={
                      workout
                        ? `${format(date, 'MMM dd')}: ${workout.splitName} (${workout.completionPercentage}% complete)`
                        : `${format(date, 'MMM dd')}: No workout`
                    }
                    arrow
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Paper
                        onClick={() => handleDayClick(date)}
                        sx={{
                          width: '100%',
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: intensity,
                          border: isCurrentDay
                            ? `2px solid ${theme.palette.primary.main}`
                            : '1px solid transparent',
                          borderRadius: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isCurrentDay ? 'bold' : 'normal',
                            color: workout ? 'white' : 'text.primary',
                            fontSize: '0.8rem',
                          }}
                        >
                          {format(date, 'd')}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>

          {/* Legend */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}
          >
            <Typography variant="caption" color="text.secondary">
              Less
            </Typography>
            {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
              <Box
                key={intensity}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.5,
                  backgroundColor: getIntensityColor({
                    id: '',
                    date: '',
                    userId: '',
                    completed: false,
                    completionPercentage: intensity * 100,
                    splitName: '',
                    setRecords: [],
                  }),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary">
              More
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderWorkoutDetails = () => {
    if (!selectedDay) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {format(new Date(selectedDay.date), 'EEEE, MMMM dd')}
                </Typography>
                <Chip
                  label={selectedDay.splitName}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Completion: {selectedDay.completionPercentage}% (
                {
                  selectedDay.setRecords.filter(
                    s => s.actualWeight !== null && s.actualReps !== null
                  ).length
                }
                /{selectedDay.setRecords.length} sets)
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontStyle: 'italic' }}
              >
                📈 View completed workout data. To log new sets, go to Dashboard.
              </Typography>

              <Grid container spacing={2}>
                {selectedDay.setRecords.map((set, index) => (
                  <Grid item xs={12} sm={6} md={4} key={set.id}>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor:
                          set.actualWeight !== null && set.actualReps !== null
                            ? `${theme.palette.primary.main}10`
                            : theme.palette.background.default,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {set.exercise.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {set.exercise.muscleGroup}
                      </Typography>

                      {set.actualWeight !== null && set.actualReps !== null ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            ✅ {set.actualWeight}kg × {set.actualReps} reps
                          </Typography>
                          {set.plannedWeight !== null && set.plannedReps !== null && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Planned: {set.plannedWeight}kg × {set.plannedReps} reps
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            ⏸️ Not completed
                          </Typography>
                          {set.plannedWeight !== null && set.plannedReps !== null && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Planned: {set.plannedWeight}kg × {set.plannedReps} reps
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
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
              : 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
          color: theme.palette.mode === 'dark' ? '#fff' : 'white',
          boxShadow: theme.shadows[16],
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
          📊 Workout History
        </Typography>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 2 }} />
      </Box>

      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              router.push('/dashboard');
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
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
              <TrendingUpIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Progress & Analytics" />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <ThemeToggle />
        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
          Toggle Dark/Light Mode
        </Typography>
      </Box>
    </Drawer>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Enhanced Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: 'none',
          boxShadow: '0 8px 32px rgba(61, 153, 112, 0.15)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <TimelineIcon sx={{ color: '#EFE9E7', fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: '#EFE9E7',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Workout History
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop Navigation - Hidden on mobile */}
            {!isMobile && (
              <>
                <Button
                  color="inherit"
                  onClick={() => router.push('/dashboard')}
                  sx={{
                    color: '#EFE9E7',
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => router.push('/progress')}
                  sx={{
                    color: '#EFE9E7',
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Progress
                </Button>
                <ThemeToggle />
              </>
            )}

            {/* Mobile Navigation - Drawer trigger */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: '#EFE9E7',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, pb: 10 }}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {error && (
            <motion.div variants={fadeInUp}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {isLoading ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 4 }} />
            </Box>
          ) : (
            <>
              {renderStatsCards()}
              {renderCalendarHeatmap()}

              {/* Help message when no day selected */}
              {!selectedDay && workoutDays.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <Card sx={{ mb: 4, textAlign: 'center' }}>
                    <CardContent sx={{ py: 4 }}>
                      <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Click on a colored day to view workout details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Colored squares represent completed workouts. Click any day with color to
                        see what exercises were performed.
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* No workouts message */}
              {!selectedDay && workoutDays.length === 0 && (
                <motion.div variants={fadeInUp}>
                  <Card sx={{ mb: 4, textAlign: 'center' }}>
                    <CardContent sx={{ py: 4 }}>
                      <FitnessCenterIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No workouts this month
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Start your first workout on the Dashboard to see your progress here.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push('/dashboard')}
                        startIcon={<FitnessCenterIcon />}
                      >
                        Start First Workout
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {renderWorkoutDetails()}
            </>
          )}
        </motion.div>
      </Container>

      {/* Render navigation drawer */}
      {renderNavigationDrawer()}
    </Box>
  );
}
