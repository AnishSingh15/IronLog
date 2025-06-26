'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useWeightUnit } from '@/contexts/WeightUnitContext';
import { useAuthStore } from '@/store/auth';
import {
  Dashboard as DashboardIcon,
  FitnessCenter as ExercisesIcon,
  FitnessCenter as FitnessCenterIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  TrendingUp as ProgressIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface AppHeaderProps {
  title?: string;
  showWeightToggle?: boolean;
}

export function AppHeader({ title = 'IronLog', showWeightToggle = true }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuthStore();
  const { useMetricSystem, toggleWeightUnit } = useWeightUnit();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'History', path: '/history', icon: <HistoryIcon /> },
    { label: 'Progress', path: '/progress', icon: <ProgressIcon /> },
    { label: 'Exercises', path: '/exercises', icon: <ExercisesIcon /> },
  ];
  const renderNavigationDrawer = () => {
    return (
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
            🏋️ {title}
          </Typography>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 2 }} />
        </Box>

        <List sx={{ px: 1 }}>
          {navigationItems.map(item => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  bgcolor: pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={toggleWeightUnit}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              title={`Switch to ${useMetricSystem ? 'pounds' : 'kilograms'}`}
            >
              <ScaleIcon />
            </IconButton>
          </Box>
          <ThemeToggle />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
            Toggle Weight Unit & Theme
          </Typography>
        </Box>
      </Drawer>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: 'none',
          boxShadow: '0 8px 32px rgba(244, 96, 54, 0.15)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <FitnessCenterIcon sx={{ color: '#EFE9E7', fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: '#EFE9E7',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop Navigation - Hidden on mobile */}
            {!isMobile && (
              <>
                {(() => {
                  return navigationItems.map(item => (
                    <Button
                      key={item.path}
                      color="inherit"
                      onClick={() => router.push(item.path)}
                      sx={{
                        color: '#EFE9E7',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        bgcolor: pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                      }}
                    >
                      {item.label}
                    </Button>
                  ));
                })()}

                {/* Weight Unit Toggle Button */}
                {showWeightToggle && (
                  <IconButton
                    onClick={toggleWeightUnit}
                    sx={{
                      color: '#EFE9E7',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                    title={`Switch to ${useMetricSystem ? 'pounds' : 'kilograms'}`}
                  >
                    <ScaleIcon />
                  </IconButton>
                )}

                <ThemeToggle />
              </>
            )}

            {/* Profile Menu */}
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                sx={{
                  bgcolor: '#EFE9E7',
                  color: '#F46036',
                  fontWeight: 600,
                  border: '2px solid rgba(239, 233, 231, 0.3)',
                  width: 32,
                  height: 32,
                  fontSize: '0.9rem',
                }}
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            {/* Mobile Navigation - Hamburger menu */}
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

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <PersonIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      {renderNavigationDrawer()}
    </>
  );
}
