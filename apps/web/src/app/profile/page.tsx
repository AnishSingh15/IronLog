'use client';

import { useAuth } from '@/hooks/useAuth';
import apiClient, { api } from '@/lib/api';
import { profileUpdateSchema } from '@/lib/validations';
import { useAuthStore } from '@/store/auth';
import {
  Cancel as CancelIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { logout } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProfileUpdate = async (values: ProfileFormData) => {
    try {
      setError(null);
      setSuccess(null);

      // Validate form data
      profileUpdateSchema.parse(values);

      const response = await api.put('/auth/profile', values);

      // Update user in store
      setUser((response.data as any)?.user);
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      if (error instanceof z.ZodError) {
        setError('Please check your input and try again.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  const handlePasswordChange = async (values: PasswordFormData) => {
    try {
      setError(null);
      setSuccess(null);

      if (values.newPassword !== values.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }

      if (values.newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }

      await api.put('/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccess('Password changed successfully!');
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Password change failed:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    ) {
      return;
    }

    try {
      await api.delete('/auth/account');
      logout();
      router.push('/');
    } catch (error: any) {
      console.error('Account deletion failed:', error);
      setError('Failed to delete account. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Profile Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account information and preferences
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </Box>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div variants={fadeInUp}>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div variants={fadeInUp}>
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </motion.div>
        )}

        {/* Profile Information */}
        <motion.div variants={fadeInUp}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Profile Information
                </Typography>
              </Box>

              {!isEditingProfile ? (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Full Name
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {user.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email Address
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {user.email}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Member Since
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Formik
                  initialValues={{
                    name: user.name,
                    email: user.email,
                  }}
                  onSubmit={handleProfileUpdate}
                >
                  {({ isSubmitting, values, handleChange, handleBlur }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="name"
                            label="Full Name"
                            fullWidth
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="email"
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" gap={2}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={isSubmitting}
                              startIcon={<SaveIcon />}
                            >
                              Save Changes
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setIsEditingProfile(false)}
                              disabled={isSubmitting}
                              startIcon={<CancelIcon />}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>

            {!isEditingProfile && (
              <CardActions>
                <Button onClick={() => setIsEditingProfile(true)} startIcon={<EditIcon />}>
                  Edit Profile
                </Button>
              </CardActions>
            )}
          </Card>
        </motion.div>

        {/* Password Change */}
        <motion.div variants={fadeInUp}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <SecurityIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Security Settings
                </Typography>
              </Box>

              {!isChangingPassword ? (
                <Box>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Change your password to keep your account secure.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: Never
                  </Typography>
                </Box>
              ) : (
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }}
                  onSubmit={handlePasswordChange}
                >
                  {({ isSubmitting, values, handleChange, handleBlur }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            fullWidth
                            value={values.currentPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="newPassword"
                            label="New Password"
                            type="password"
                            fullWidth
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                            helperText="Must be at least 8 characters long"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" gap={2}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={isSubmitting}
                              startIcon={<SaveIcon />}
                            >
                              Change Password
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setIsChangingPassword(false)}
                              disabled={isSubmitting}
                              startIcon={<CancelIcon />}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>

            {!isChangingPassword && (
              <CardActions>
                <Button onClick={() => setIsChangingPassword(true)} startIcon={<SecurityIcon />}>
                  Change Password
                </Button>
              </CardActions>
            )}
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Account Actions
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth onClick={logout} startIcon={<LogoutIcon />}>
                    Sign Out
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" color="error" fullWidth onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" color="text.secondary">
                <strong>Delete Account:</strong> Once you delete your account, there is no going
                back. Please be certain. All your workout data will be permanently removed.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
}
