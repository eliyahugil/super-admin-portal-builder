import { useState, useEffect, useCallback } from 'react';
import { useCurrentBusiness } from './useCurrentBusiness';

export interface ViewPreferences {
  // תצוגה כללית
  viewType: 'week' | 'list';
  showNewShifts: boolean;
  
  // סינונים
  filters: {
    status: string;
    employee: string;
    branch: string;
    role: string;
  };
  
  // תצוגת שבוע
  selectedWeek?: string; // ISO date string
  
  // אחרון עדכון
  lastUpdated: number;
}

const DEFAULT_PREFERENCES: ViewPreferences = {
  viewType: 'week',
  showNewShifts: true,
  filters: {
    status: 'all',
    employee: 'all', 
    branch: 'all',
    role: 'all'
  },
  lastUpdated: Date.now()
};

export const useViewPreferences = () => {
  const { businessId } = useCurrentBusiness();
  const [preferences, setPreferences] = useState<ViewPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // יצירת מפתח ייחודי לכל עסק
  const getStorageKey = useCallback(() => {
    return `shift_schedule_preferences_${businessId}`;
  }, [businessId]);

  // טעינת העדפות מ-localStorage
  const loadPreferences = useCallback(() => {
    if (!businessId) return;
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored) as ViewPreferences;
        
        // בדיקה שהעדפות לא ישנות מדי (7 ימים)
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.lastUpdated < weekInMs) {
          console.log('📋 Loaded view preferences:', parsed);
          setPreferences(parsed);
        } else {
          console.log('📋 Preferences expired, using defaults');
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    } catch (error) {
      console.error('Error loading view preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, getStorageKey]);

  // שמירת העדפות ל-localStorage
  const savePreferences = useCallback((newPreferences: Partial<ViewPreferences>) => {
    if (!businessId) return;

    const updated: ViewPreferences = {
      ...preferences,
      ...newPreferences,
      lastUpdated: Date.now()
    };

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      setPreferences(updated);
      console.log('💾 Saved view preferences:', updated);
    } catch (error) {
      console.error('Error saving view preferences:', error);
    }
  }, [businessId, preferences, getStorageKey]);

  // עדכון סוג תצוגה
  const updateViewType = useCallback((viewType: 'week' | 'list') => {
    savePreferences({ viewType });
  }, [savePreferences]);

  // עדכון הצגת משמרות חדשות
  const updateShowNewShifts = useCallback((showNewShifts: boolean) => {
    savePreferences({ showNewShifts });
  }, [savePreferences]);

  // עדכון סינונים
  const updateFilters = useCallback((filters: Partial<ViewPreferences['filters']>) => {
    savePreferences({ 
      filters: { ...preferences.filters, ...filters }
    });
  }, [savePreferences, preferences.filters]);

  // עדכון שבוע נבחר
  const updateSelectedWeek = useCallback((date: Date) => {
    savePreferences({ 
      selectedWeek: date.toISOString().split('T')[0]
    });
  }, [savePreferences]);

  // איפוס העדפות
  const resetPreferences = useCallback(() => {
    const reset = { ...DEFAULT_PREFERENCES, lastUpdated: Date.now() };
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(reset));
      setPreferences(reset);
      console.log('🔄 Reset view preferences');
    } catch (error) {
      console.error('Error resetting view preferences:', error);
    }
  }, [getStorageKey]);

  // טעינה ראשונית
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    updateViewType,
    updateShowNewShifts,
    updateFilters,
    updateSelectedWeek,
    resetPreferences,
    savePreferences
  };
};