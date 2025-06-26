'use client';

import { AppHeader } from '@/components/AppHeader';
import { WeightDisplay } from '@/components/WeightComponents';
import { useWeightUnit } from '@/contexts/WeightUnitContext';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

interface SetRecord {
  id: string;
  actualWeight: number;
  actualReps: number;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
  };
  workoutDay: {
    date: string;
  };
}

interface ExerciseStats {
  exerciseName: string;
  muscleGroup: string;
  bestSet: {
    weight: number;
    reps: number;
    oneRM: number;
  };
  totalVolume: number;
  avgVolume: number;
  totalSets: number;
  lastPerformed: string;
  progression: number; // Percentage change from first to latest performance
}

interface VolumeData {
  muscleGroup: string;
  volume: number;
  sets: number;
}

export default function ProgressPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { useMetricSystem } = useWeightUnit();

  const [setRecords, setSetRecords] = useState<SetRecord[]>([]);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Filters and sorting
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'oneRM' | 'volume' | 'lastPerformed'>('oneRM');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const muscleGroups = ['all', ...new Set(exerciseStats.map(stat => stat.muscleGroup))];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadProgressData();
  }, [isAuthenticated, router]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all set records
      const response = await api.get('/set-records');
      const responseData = response.data as any;
      const records: SetRecord[] = (responseData.data || responseData).filter(
        (record: SetRecord) => record.actualWeight && record.actualReps
      );

      setSetRecords(records);
      calculateExerciseStats(records);
      calculateVolumeData(records);
    } catch (error: any) {
      console.error('Failed to load progress data:', error);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExerciseStats = (records: SetRecord[]) => {
    const exerciseMap = new Map<string, ExerciseStats>();

    records.forEach(record => {
      const { exercise } = record;
      const oneRM = calculateOneRM(record.actualWeight, record.actualReps);
      const volume = record.actualWeight * record.actualReps;

      if (!exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, {
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          bestSet: {
            weight: record.actualWeight,
            reps: record.actualReps,
            oneRM,
          },
          totalVolume: volume,
          avgVolume: volume,
          totalSets: 1,
          lastPerformed: record.workoutDay.date,
          progression: 0,
        });
      } else {
        const stats = exerciseMap.get(exercise.id)!;

        // Update best set if this one is better
        if (oneRM > stats.bestSet.oneRM) {
          stats.bestSet = {
            weight: record.actualWeight,
            reps: record.actualReps,
            oneRM,
          };
        }

        // Update totals
        stats.totalVolume += volume;
        stats.totalSets += 1;
        stats.avgVolume = stats.totalVolume / stats.totalSets;

        // Update last performed if this is more recent
        if (new Date(record.workoutDay.date) > new Date(stats.lastPerformed)) {
          stats.lastPerformed = record.workoutDay.date;
        }
      }
    });

    // Calculate progression for each exercise
    exerciseMap.forEach((stats, exerciseId) => {
      const exerciseRecords = records
        .filter(r => r.exercise.id === exerciseId)
        .sort(
          (a, b) => new Date(a.workoutDay.date).getTime() - new Date(b.workoutDay.date).getTime()
        );

      if (exerciseRecords.length > 1) {
        const firstRecord = exerciseRecords[0];
        const lastRecord = exerciseRecords[exerciseRecords.length - 1];
        const firstOneRM = calculateOneRM(firstRecord.actualWeight, firstRecord.actualReps);
        const lastOneRM = calculateOneRM(lastRecord.actualWeight, lastRecord.actualReps);
        stats.progression = ((lastOneRM - firstOneRM) / firstOneRM) * 100;
      }
    });

    setExerciseStats(Array.from(exerciseMap.values()));
  };

  const calculateVolumeData = (records: SetRecord[]) => {
    const volumeMap = new Map<string, { volume: number; sets: number }>();

    records.forEach(record => {
      const { muscleGroup } = record.exercise;
      const volume = record.actualWeight * record.actualReps;

      if (!volumeMap.has(muscleGroup)) {
        volumeMap.set(muscleGroup, { volume, sets: 1 });
      } else {
        const data = volumeMap.get(muscleGroup)!;
        data.volume += volume;
        data.sets += 1;
      }
    });

    const volumeData: VolumeData[] = Array.from(volumeMap.entries()).map(([muscleGroup, data]) => ({
      muscleGroup,
      volume: data.volume,
      sets: data.sets,
    }));

    setVolumeData(volumeData);
  };

  const calculateOneRM = (weight: number, reps: number): number => {
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30));
  };

  const filteredAndSortedStats = exerciseStats
    .filter(stat => muscleGroupFilter === 'all' || stat.muscleGroup === muscleGroupFilter)
    .sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortBy) {
        case 'oneRM':
          aValue = a.bestSet.oneRM;
          bValue = b.bestSet.oneRM;
          break;
        case 'volume':
          aValue = a.totalVolume;
          bValue = b.totalVolume;
          break;
        case 'lastPerformed':
          aValue = new Date(a.lastPerformed).getTime();
          bValue = new Date(b.lastPerformed).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressionColor = (progression: number) => {
    if (progression > 0) return theme.palette.success.main;
    if (progression < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const chartColors = ['#F46036', '#3D9970', '#A3B18A', '#9C6644', '#E66CB2'];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppHeader title="Progress Tracker" />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {error && (
            <motion.div variants={fadeInUp}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Filters and Controls */}
          <motion.div variants={fadeInUp}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Muscle Group</InputLabel>
                      <Select
                        value={muscleGroupFilter}
                        label="Muscle Group"
                        onChange={e => setMuscleGroupFilter(e.target.value)}
                        startAdornment={<FilterIcon sx={{ mr: 1 }} />}
                      >
                        {muscleGroups.map(group => (
                          <MenuItem key={group} value={group}>
                            {group === 'all' ? 'All Muscle Groups' : group}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={e => setSortBy(e.target.value as any)}
                        startAdornment={<SortIcon sx={{ mr: 1 }} />}
                      >
                        <MenuItem value="oneRM">1-Rep Max</MenuItem>
                        <MenuItem value="volume">Total Volume</MenuItem>
                        <MenuItem value="lastPerformed">Last Performed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      startIcon={<SortIcon />}
                      fullWidth
                    >
                      {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* Volume Charts */}
          {!isLoading && volumeData.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Volume by Muscle Group
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={volumeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="muscleGroup" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              name === 'volume'
                                ? `${value} ${useMetricSystem ? 'kg' : 'lbs'}`
                                : value,
                              name === 'volume' ? 'Total Volume' : 'Total Sets',
                            ]}
                          />
                          <Bar dataKey="volume" fill="#F46036" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sets Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={volumeData}
                            dataKey="sets"
                            nameKey="muscleGroup"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ muscleGroup, percent }: any) =>
                              `${muscleGroup}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {volumeData.map((entry, index) => (
                              <Cell key={index} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Exercise Stats Table */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Records & Performance
                </Typography>
                {isLoading ? (
                  <Box>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Exercise</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Muscle Group</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Best Set</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>1-Rep Max</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Total Volume</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Total Sets</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Progression</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Last Performed</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAndSortedStats.map(stat => (
                          <TableRow key={stat.exerciseName} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {stat.exerciseName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={stat.muscleGroup}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
                                  color: '#EFE9E7',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                <WeightDisplay weight={stat.bestSet.weight} /> × {stat.bestSet.reps}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold">
                                <WeightDisplay weight={stat.bestSet.oneRM} />
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                <WeightDisplay weight={Math.round(stat.totalVolume)} />
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">{stat.totalSets}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: getProgressionColor(stat.progression) }}
                                fontWeight="bold"
                              >
                                {stat.progression > 0 ? '+' : ''}
                                {stat.progression.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {formatDate(stat.lastPerformed)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {!isLoading && filteredAndSortedStats.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <BarChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No progress data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete some workouts to see your progress stats!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
