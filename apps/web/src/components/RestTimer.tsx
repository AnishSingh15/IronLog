'use client';

import {
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Refresh as ResetIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  IconButton,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  onTimerEnd?: () => void;
  onClose?: () => void;
  defaultTime?: number; // in seconds
  isVisible?: boolean;
}

export function RestTimer({
  onTimerEnd,
  onClose,
  defaultTime = 180, // 3 minutes default
  isVisible = false,
}: RestTimerProps) {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(defaultTime);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio context for bell sound
  useEffect(() => {
    // Create a simple bell sound using Web Audio API
    const createBellSound = () => {
      if (typeof window === 'undefined') return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      const playBell = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Bell-like frequency progression
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

        // Bell-like volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
      };

      return playBell;
    };

    if (!audioRef.current) {
      audioRef.current = createBellSound() as any;
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      try {
        (audioRef.current as any)();
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  }, [isSoundEnabled]);

  const startTimer = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft(targetTime);
    }
    setIsRunning(true);
  }, [timeLeft, targetTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(targetTime);
  }, [targetTime]);

  const handleTimeChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      const value = Array.isArray(newValue) ? newValue[0] : newValue;
      setTargetTime(value);
      if (!isRunning) {
        setTimeLeft(value);
      }
    },
    [isRunning]
  );

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotificationSound();
            onTimerEnd?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, playNotificationSound, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = targetTime > 0 ? ((targetTime - timeLeft) / targetTime) * 100 : 0;
  const circleRadius = 80;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressOffset = circleCircumference - (progress / 100) * circleCircumference;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card
        sx={{
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
              : 'linear-gradient(135deg, #3D9970 0%, #A3B18A 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Rest Timer
            </Typography>
            {onClose && (
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Circular Progress Timer */}
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke={timeLeft <= 10 ? '#ff4444' : '#4CAF50'}
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={progressOffset}
                initial={{ strokeDashoffset: circleCircumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </svg>

            {/* Timer display */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{
                  scale: timeLeft <= 10 && isRunning ? [1, 1.1, 1] : 1,
                  color: timeLeft <= 10 ? '#ff4444' : 'white',
                }}
                transition={{
                  scale: { duration: 1, repeat: timeLeft <= 10 && isRunning ? Infinity : 0 },
                  color: { duration: 0.3 },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
              </motion.div>
            </Box>
          </Box>

          {/* Time Slider */}
          <Box sx={{ mb: 3, px: 2 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white',
              }}
            >
              Set Rest Time: {formatTime(targetTime)}
            </Typography>
            <Slider
              value={targetTime}
              onChange={handleTimeChange}
              min={30}
              max={600} // 10 minutes max
              step={30}
              disabled={isRunning}
              size="medium"
              sx={{
                color: 'white',
                height: 8,
                '& .MuiSlider-thumb': {
                  backgroundColor: 'white',
                  width: 24,
                  height: 24,
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(255,255,255,0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'white',
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  height: 4,
                },
                '& .MuiSlider-markLabel': {
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                },
              }}
              marks={[
                { value: 60, label: '1m' },
                { value: 120, label: '2m' },
                { value: 180, label: '3m' },
                { value: 240, label: '4m' },
                { value: 300, label: '5m' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={value => formatTime(value)}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                opacity: 0.8,
                color: 'white',
              }}
            >
              {isRunning
                ? 'Timer is running - stop to change time'
                : 'Drag to set custom rest time (30s - 10m)'}
            </Typography>
          </Box>

          {/* Quick Time Preset Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[60, 90, 120, 180, 240, 300].map(seconds => (
              <Button
                key={seconds}
                size="small"
                variant={targetTime === seconds ? 'contained' : 'outlined'}
                onClick={() => {
                  if (!isRunning) {
                    setTargetTime(seconds);
                    setTimeLeft(seconds);
                  }
                }}
                disabled={isRunning}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  minWidth: '45px',
                  ...(targetTime === seconds && {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }),
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {formatTime(seconds)}
              </Button>
            ))}
          </Box>

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={resetTimer}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ResetIcon />
            </IconButton>

            <Fab
              color="primary"
              onClick={isRunning ? pauseTimer : startTimer}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                width: 64,
                height: 64,
              }}
            >
              {isRunning ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
            </Fab>

            <IconButton
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {isSoundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Box>

          {timeLeft === 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Typography variant="h6" sx={{ mt: 2, color: '#4CAF50', fontWeight: 'bold' }}>
                Rest Complete! 💪
              </Typography>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
