'use client';

import { useWeightUnit } from '@/contexts/WeightUnitContext';
import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';

interface WeightInputProps extends Omit<TextFieldProps, 'label'> {
  customLabel?: string;
}

export function WeightInput({ customLabel, ...props }: WeightInputProps) {
  const { getWeightUnit } = useWeightUnit();
  
  const label = customLabel || `Weight (${getWeightUnit()})`;

  return (
    <TextField
      {...props}
      label={label}
      type="number"
    />
  );
}

interface WeightDisplayProps {
  weight: number;
  showConversion?: boolean;
  className?: string;
}

export function WeightDisplay({ weight, showConversion = true, className }: WeightDisplayProps) {
  const { formatWeightDisplay, useMetricSystem, getWeightUnit } = useWeightUnit();

  if (!showConversion) {
    return <span className={className}>{weight} {getWeightUnit()}</span>;
  }

  return <span className={className}>{formatWeightDisplay(weight)}</span>;
}
