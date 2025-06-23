'use client';

import { useAuthStore } from '@/store/auth';
import {
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const navigationItems = [
  {
    label: 'Dashboard',
    value: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'History',
    value: '/history',
    icon: <HistoryIcon />,
  },
  {
    label: 'Profile',
    value: '/profile',
    icon: <PersonIcon />,
  },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Only show bottom navigation on authenticated pages
  if (!isAuthenticated || pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  const handleNavChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={8}
        data-testid="bottom-navigation"
      >
        <BottomNavigation
          value={pathname}
          onChange={handleNavChange}
          sx={{
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              padding: '6px 12px 8px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              '&.Mui-selected': {
                fontSize: '0.75rem',
              },
            },
          }}
        >
          {navigationItems.map(item => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
              data-testid={`${item.label.toLowerCase()}-nav`}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </motion.div>
  );
}
