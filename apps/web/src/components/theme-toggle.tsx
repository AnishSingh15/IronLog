'use client';

import { DarkMode, LightMode, SettingsBrightness } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton size="small">
        <SettingsBrightness />
      </IconButton>
    );
  }

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <LightMode />;
      case 'dark':
        return <DarkMode />;
      default:
        return <SettingsBrightness />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      default:
        return 'Switch to light mode';
    }
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton
        onClick={handleToggle}
        size="small"
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(244, 96, 54, 0.1)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
}
