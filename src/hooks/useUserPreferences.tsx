import { useState, useEffect } from 'react';
import { useCurrentBusiness } from './useCurrentBusiness';

export type ScheduleViewPreference = 'week' | 'month' | 'year' | 'grouped';

interface UserPreferences {
  defaultScheduleView: ScheduleViewPreference;
  showWeekends: boolean;
  compactView: boolean;
  groupByBranch: boolean;
  showEmployeeStats: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultScheduleView: 'grouped', // תצוגה מקובצת כברירת מחדל
  showWeekends: true,
  compactView: false,
  groupByBranch: true,
  showEmployeeStats: true
};

export const useUserPreferences = () => {
  const { businessId } = useCurrentBusiness();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // טעינת העדפות משתמש מ-localStorage
  useEffect(() => {
    if (businessId) {
      const storageKey = `user_preferences_${businessId}`;
      const savedPreferences = localStorage.getItem(storageKey);
      
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
        } catch (error) {
          console.error('Error parsing user preferences:', error);
          setPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
    setLoading(false);
  }, [businessId]);

  // שמירת העדפות ב-localStorage
  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    if (!businessId) return;

    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    const storageKey = `user_preferences_${businessId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // עדכון תצוגת ברירת המחדל
  const setDefaultScheduleView = (view: ScheduleViewPreference) => {
    updatePreferences({ defaultScheduleView: view });
  };

  // איפוס להגדרות ברירת מחדל
  const resetToDefaults = () => {
    if (!businessId) return;
    
    setPreferences(DEFAULT_PREFERENCES);
    const storageKey = `user_preferences_${businessId}`;
    localStorage.setItem(storageKey, JSON.stringify(DEFAULT_PREFERENCES));
  };

  return {
    preferences,
    loading,
    updatePreferences,
    setDefaultScheduleView,
    resetToDefaults
  };
};