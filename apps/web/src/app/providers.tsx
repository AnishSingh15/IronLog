'use client';

import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { WeightUnitProvider } from '@/contexts/WeightUnitContext';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

const createAppTheme = (mode: 'light' | 'dark') => {
  // IronLog Color Palette
  const colors = {
    orange: '#F46036',
    green: '#3D9970',
    sage: '#A3B18A',
    brown: '#9C6644',
    pink: '#E66CB2',
    charcoal: '#3E3E3E',
    cream: '#EFE9E7',
    mint: '#EAEEEA',
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.orange,
        light: mode === 'light' ? '#F67356' : '#F46036',
        dark: mode === 'light' ? '#E34F25' : '#F46036',
        contrastText: colors.cream,
      },
      secondary: {
        main: colors.sage,
        light: mode === 'light' ? '#B3C19A' : '#A3B18A',
        dark: mode === 'light' ? '#93A17A' : '#A3B18A',
        contrastText: colors.charcoal,
      },
      success: {
        main: colors.green,
        light: mode === 'light' ? '#5DA980' : '#3D9970',
        dark: mode === 'light' ? '#2D7960' : '#3D9970',
        contrastText: colors.cream,
      },
      warning: {
        main: colors.orange,
        light: mode === 'light' ? '#F67356' : '#F46036',
        dark: mode === 'light' ? '#E34F25' : '#F46036',
        contrastText: colors.cream,
      },
      info: {
        main: colors.pink,
        light: mode === 'light' ? '#EA7FC2' : '#E66CB2',
        dark: mode === 'light' ? '#E259A2' : '#E66CB2',
        contrastText: colors.cream,
      },
      background: {
        default: mode === 'light' ? colors.cream : colors.charcoal,
        paper: mode === 'light' ? colors.mint : '#4A4A4A',
      },
      text: {
        primary: mode === 'light' ? colors.charcoal : colors.cream,
        secondary: mode === 'light' ? '#5A5A5A' : '#C5C5C5',
      },
      divider: mode === 'light' ? '#D4D4D4' : '#5A5A5A',
      action: {
        hover: mode === 'light' ? colors.mint : '#5A5A5A',
        selected: mode === 'light' ? '#E0E4E0' : '#6A6A6A',
      },
    },
    typography: {
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '0.75rem',
            fontWeight: 500,
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background:
              mode === 'light'
                ? 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)'
                : 'linear-gradient(135deg, #F46036 0%, #E66CB2 100%)',
            color: colors.cream,
            '&:hover': {
              background:
                mode === 'light'
                  ? 'linear-gradient(135deg, #E34F25 0%, #D555A1 100%)'
                  : 'linear-gradient(135deg, #E34F25 0%, #D555A1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(244, 96, 54, 0.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '1rem',
            border: mode === 'light' ? `1px solid ${colors.mint}` : `1px solid #5A5A5A`,
            boxShadow:
              mode === 'light'
                ? '0 4px 6px -1px rgba(244, 96, 54, 0.1), 0 2px 4px -2px rgba(244, 96, 54, 0.05)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            background: mode === 'light' ? colors.mint : '#4A4A4A',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.75rem',
              backgroundColor: mode === 'light' ? colors.cream : '#4A4A4A',
              '& fieldset': {
                borderColor: mode === 'light' ? colors.sage : '#6A6A6A',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? colors.orange : colors.pink,
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'light' ? colors.orange : colors.pink,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? colors.cream : colors.charcoal,
            backgroundImage: 'none',
            borderBottom: `1px solid ${mode === 'light' ? colors.sage : '#5A5A5A'}`,
            boxShadow: 'none',
          },
        },
      },
    },
  });
};

function MuiThemeWrapper({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light theme as fallback during initial server render to prevent hydration mismatch
  const currentTheme = mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : 'light';
  const muiTheme = createAppTheme(currentTheme);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WeightUnitProvider>
      <ThemeProvider>
        <MuiThemeWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MuiThemeWrapper>
      </ThemeProvider>
    </WeightUnitProvider>
  );
}
