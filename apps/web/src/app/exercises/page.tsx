'use client';

import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { useExercises, type Exercise, type ExerciseFormData } from '@/hooks/useExercises';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
];

const muscleGroupColors = {
  Chest: '#FF6B6B',
  Back: '#4ECDC4',
  Shoulders: '#45B7D1',
  Arms: '#96CEB4',
  Legs: '#FFEAA7',
  Core: '#DDA0DD',
  Cardio: '#FFA07A',
  'Full Body': '#98D8C8',
};

export default function ExercisesPage() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    muscleGroup: '',
    defaultSets: 3,
    defaultReps: 10,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Use the custom hook with filters
  const {
    exercises,
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
  } = useExercises({
    search: searchTerm,
    muscleGroup: selectedMuscleGroup,
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        defaultSets: exercise.defaultSets,
        defaultReps: exercise.defaultReps,
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: '',
        muscleGroup: '',
        defaultSets: 3,
        defaultReps: 10,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExercise(null);
    setFormData({
      name: '',
      muscleGroup: '',
      defaultSets: 3,
      defaultReps: 10,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.muscleGroup) {
      return;
    }

    try {
      setSubmitLoading(true);
      
      const result = editingExercise
        ? await updateExercise(editingExercise.id, formData)
        : await createExercise(formData);

      if (result.success) {
        handleCloseDialog();
        showSnackbar(
          editingExercise 
            ? `Exercise "${formData.name}" updated successfully!`
            : `Exercise "${formData.name}" added successfully!`,
          'success'
        );
      } else {
        showSnackbar(result.error || 'Failed to save exercise', 'error');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      showSnackbar('Failed to save exercise', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (exercise: Exercise) => {
    if (!confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
      return;
    }

    try {
      const result = await deleteExercise(exercise.id);
      if (result.success) {
        showSnackbar(`Exercise "${exercise.name}" deleted successfully!`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete exercise', 'error');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showSnackbar('Failed to delete exercise', 'error');
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = !searchTerm || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || 
      exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  const exercisesByMuscleGroup = filteredExercises.reduce((acc, exercise) => {
    const group = exercise.muscleGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <>
      <AppHeader title="Exercise Manager" showWeightToggle={false} />
      
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1,
            }}
          >
            Exercise Manager
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage your exercise database - add, edit, or remove exercises for your workouts
          </Typography>

          {/* Search and Filter Controls */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Muscle Group</InputLabel>
              <Select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                label="Muscle Group"
              >
                <MenuItem value="">All Groups</MenuItem>
                {MUSCLE_GROUPS.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedMuscleGroup('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <>
            {/* Stats */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total Exercises: {filteredExercises.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(exercisesByMuscleGroup).map(([group, exercises]) => (
                  <Chip
                    key={group}
                    label={`${group} (${exercises.length})`}
                    sx={{
                      bgcolor: muscleGroupColors[group as keyof typeof muscleGroupColors] || '#E0E0E0',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Exercise Grid */}
            {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, groupExercises]) => (
              <Box key={muscleGroup} sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: muscleGroupColors[muscleGroup as keyof typeof muscleGroupColors],
                  }}
                >
                  {muscleGroup} ({groupExercises.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {groupExercises.map((exercise, index) => (
                    <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.25 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.25s ease-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[8],
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontWeight: 600,
                                mb: 1,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {exercise.name}
                            </Typography>
                            
                            <Chip
                              size="small"
                              label={exercise.muscleGroup}
                              sx={{
                                bgcolor: muscleGroupColors[exercise.muscleGroup as keyof typeof muscleGroupColors] || '#E0E0E0',
                                color: 'white',
                                mb: 2,
                              }}
                            />
                            
                            <Typography variant="body2" color="text.secondary">
                              Default: {exercise.defaultSets} sets × {exercise.defaultReps} reps
                            </Typography>
                          </CardContent>
                          
                          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(exercise)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(exercise)}
                              sx={{ color: theme.palette.error.main }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {filteredExercises.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No exercises found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || selectedMuscleGroup
                    ? 'Try adjusting your search filters'
                    : 'Get started by adding your first exercise'}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Add Exercise FAB */}
        <Fab
          color="primary"
          aria-label="add exercise"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E55530 0%, #D55CA0 100%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.25s ease-out',
          }}
        >
          <AddIcon />
        </Fab>

        {/* Add/Edit Exercise Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle>
            {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                label="Exercise Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Bench Press, Squats, etc."
              />
              
              <FormControl fullWidth required>
                <InputLabel>Muscle Group</InputLabel>
                <Select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  label="Muscle Group"
                >
                  {MUSCLE_GROUPS.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Default Sets"
                  type="number"
                  value={formData.defaultSets}
                  onChange={(e) => setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1, max: 10 }}
                  fullWidth
                />
                
                <TextField
                  label="Default Reps"
                  type="number"
                  value={formData.defaultReps}
                  onChange={(e) => setFormData({ ...formData, defaultReps: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1, max: 100 }}
                  fullWidth
                />
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name.trim() || !formData.muscleGroup || submitLoading}
              sx={{
                background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E55530 0%, #D55CA0 100%)',
                },
              }}
            >
              {submitLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editingExercise ? 'Update Exercise' : 'Add Exercise'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
