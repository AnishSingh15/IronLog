'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { FitnessCenter, LoginOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LoginPage() {
  const theme = useTheme();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('📋 Form submitted:', data);
    console.log('📊 Current loading state before login:', isLoading);

    setError('');

    try {
      const result = await login(data.email, data.password);
      console.log('📊 Login result:', result);
      console.log('📊 Loading state after login:', isLoading);

      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('🚨 Unexpected error in onSubmit:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #3E3E3E 0%, #4A4A4A 100%)'
            : 'linear-gradient(135deg, #EFE9E7 0%, #EAEEEA 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="sm">
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <motion.div variants={fadeInUp}>
            <Paper
              elevation={24}
              sx={{
                p: 6,
                borderRadius: 4,
                background:
                  theme.palette.mode === 'dark'
                    ? 'rgba(62, 62, 62, 0.95)'
                    : 'rgba(239, 233, 231, 0.95)',
                backdropFilter: 'blur(20px)',
                border:
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(244, 96, 54, 0.2)'
                    : '1px solid rgba(244, 96, 54, 0.1)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 25px 50px -12px rgba(244, 96, 54, 0.25)'
                    : '0 25px 50px -12px rgba(244, 96, 54, 0.15)',
              }}
            >
              <Box textAlign="center" sx={{ mb: 4 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                      mb: 3,
                      boxShadow: '0 10px 25px rgba(244, 96, 54, 0.3)',
                    }}
                  >
                    <FitnessCenter sx={{ fontSize: 40, color: '#EFE9E7' }} />
                  </Box>
                </motion.div>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  IronLog
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Welcome back! Sign in to continue your fitness journey.
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={fadeInUp}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    {...register('email')}
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    {...register('password')}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <LoginOutlined />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
                      color: '#EFE9E7',
                      boxShadow: '0 10px 25px rgba(244, 96, 54, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E34F25 0%, #D555A1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 35px rgba(244, 96, 54, 0.4)',
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground,
                        transform: 'none',
                        boxShadow: 'none',
                      },
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    component={Link}
                    href="/register"
                    variant="text"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}10`,
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
