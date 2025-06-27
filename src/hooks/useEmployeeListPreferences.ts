
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

export type PageSize = 10 | 25 | 50 | 100 | 'unlimited';

export interface EmployeeListFilters {
  searchTerm: string;
  employeeType: string;
  status: 'all' | 'active' | 'inactive';
  branch: string;
  tenure: 'all' | 'new' | 'experienced' | 'veteran'; // חדש, מנוסה, ותיק
  sortBy: 'name' | 'hire_date' | 'employee_type' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface EmployeeListPreferences {
  pageSize: PageSize;
  filters: EmployeeListFilters;
  showAdvancedFilters: boolean;
}

const DEFAULT_PREFERENCES: EmployeeListPreferences = {
  pageSize: 25,
  filters: {
    searchTerm: '',
    employeeType: 'all',
    status: 'all',
    branch: 'all',
    tenure: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  showAdvancedFilters: false,
};

export const useEmployeeListPreferences = (businessId?: string | null) => {
  const { profile } = useAuth();
  const storageKey = `employee-list-preferences-${profile?.id}-${businessId || 'default'}`;
  
  const [preferences, setPreferences] = useState<EmployeeListPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // שמירה ל-localStorage כאשר העדפות משתנות
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    }
  }, [preferences, storageKey]);

  const updatePageSize = (pageSize: PageSize) => {
    setPreferences(prev => ({ ...prev, pageSize }));
  };

  const updateFilters = (updates: Partial<EmployeeListFilters>) => {
    setPreferences(prev => ({
      ...prev,
      filters: { ...prev.filters, ...updates }
    }));
  };

  const toggleAdvancedFilters = () => {
    setPreferences(prev => ({
      ...prev,
      showAdvancedFilters: !prev.showAdvancedFilters
    }));
  };

  const resetFilters = () => {
    setPreferences(prev => ({
      ...prev,
      filters: DEFAULT_PREFERENCES.filters
    }));
  };

  const resetAllPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePageSize,
    updateFilters,
    toggleAdvancedFilters,
    resetFilters,
    resetAllPreferences,
  };
};
