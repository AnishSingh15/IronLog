'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WeightUnitContextType {
  useMetricSystem: boolean;
  toggleWeightUnit: () => void;
  formatWeightDisplay: (weight: number) => string;
  getWeightUnit: () => string;
  convertWeight: (weight: number, toMetric?: boolean) => number;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

export const useWeightUnit = () => {
  const context = useContext(WeightUnitContext);
  if (context === undefined) {
    throw new Error('useWeightUnit must be used within a WeightUnitProvider');
  }
  return context;
};

interface WeightUnitProviderProps {
  children: React.ReactNode;
}

export const WeightUnitProvider: React.FC<WeightUnitProviderProps> = ({ children }) => {
  const [useMetricSystem, setUseMetricSystem] = useState(true); // true for kg, false for lbs

  // Load weight preference on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('useMetricSystem');
    if (savedPreference !== null) {
      setUseMetricSystem(savedPreference === 'true');
    }
  }, []);

  const toggleWeightUnit = async () => {
    try {
      const newMetricSystem = !useMetricSystem;
      setUseMetricSystem(newMetricSystem);
      
      // Save preference to localStorage
      localStorage.setItem('useMetricSystem', newMetricSystem.toString());
      
      // Optionally call an API to save user preference
      // await apiClient.patch('/user/preferences', { useMetricSystem: newMetricSystem });
    } catch (error) {
      console.error('Failed to toggle weight unit:', error);
    }
  };

  const formatWeightDisplay = (weight: number) => {
    if (useMetricSystem) {
      const lbs = (weight * 2.20462).toFixed(1);
      return `${weight} kg (${lbs} lbs)`;
    } else {
      const kg = (weight / 2.20462).toFixed(1);
      return `${weight} lbs (${kg} kg)`;
    }
  };

  const getWeightUnit = () => {
    return useMetricSystem ? 'kg' : 'lbs';
  };

  const convertWeight = (weight: number, toMetric?: boolean) => {
    if (toMetric === undefined) {
      toMetric = useMetricSystem;
    }
    
    if (toMetric) {
      return useMetricSystem ? weight : weight / 2.20462;
    } else {
      return useMetricSystem ? weight * 2.20462 : weight;
    }
  };

  const value: WeightUnitContextType = {
    useMetricSystem,
    toggleWeightUnit,
    formatWeightDisplay,
    getWeightUnit,
    convertWeight,
  };

  return (
    <WeightUnitContext.Provider value={value}>
      {children}
    </WeightUnitContext.Provider>
  );
};
