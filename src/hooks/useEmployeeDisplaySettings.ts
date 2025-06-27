
import { useState, useEffect } from 'react';

interface EmployeeDisplaySettings {
  displayMode: 'actual' | 'custom';
  customCounts: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    archivedEmployees: number;
  };
}

const DEFAULT_SETTINGS: EmployeeDisplaySettings = {
  displayMode: 'actual',
  customCounts: {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    archivedEmployees: 0,
  }
};

export const useEmployeeDisplaySettings = (businessId?: string | null) => {
  const storageKey = `employee-display-settings-${businessId || 'default'}`;
  
  const [settings, setSettings] = useState<EmployeeDisplaySettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    }
  }, [settings, storageKey]);

  const updateDisplayMode = (mode: 'actual' | 'custom') => {
    setSettings(prev => ({ ...prev, displayMode: mode }));
  };

  const updateCustomCounts = (counts: Partial<EmployeeDisplaySettings['customCounts']>) => {
    setSettings(prev => ({
      ...prev,
      customCounts: { ...prev.customCounts, ...counts }
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateDisplayMode,
    updateCustomCounts,
    resetToDefaults,
  };
};
