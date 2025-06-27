
import { useState, useEffect } from 'react';

export interface EmployeeListFilters {
  searchTerm: string;
  status: 'all' | 'active' | 'inactive';
  employeeType: 'all' | 'permanent' | 'temporary' | 'youth' | 'contractor';
  branch: string;
  sortBy: 'name' | 'hire_date' | 'employee_type' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface EmployeeListPreferences {
  pageSize: 'limited' | 'unlimited';
  showAdvancedFilters: boolean;
  filters: EmployeeListFilters;
}

const defaultFilters: EmployeeListFilters = {
  searchTerm: '',
  status: 'all',
  employeeType: 'all',
  branch: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

const defaultPreferences: EmployeeListPreferences = {
  pageSize: 'unlimited',
  showAdvancedFilters: false,
  filters: defaultFilters,
};

export const useEmployeeListPreferences = (businessId?: string | null) => {
  const [preferences, setPreferences] = useState<EmployeeListPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (!businessId) return;
    
    try {
      const key = `employee-list-preferences-${businessId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({
          ...prev,
          ...parsed,
          filters: {
            ...prev.filters,
            ...parsed.filters
          }
        }));
      }
    } catch (error) {
      console.error('Error loading employee list preferences:', error);
    }
  }, [businessId]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!businessId) return;
    
    try {
      const key = `employee-list-preferences-${businessId}`;
      localStorage.setItem(key, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving employee list preferences:', error);
    }
  }, [preferences, businessId]);

  const updateFilters = (updates: Partial<EmployeeListFilters>) => {
    setPreferences(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...updates
      }
    }));
  };

  const updatePageSize = (pageSize: EmployeeListPreferences['pageSize']) => {
    setPreferences(prev => ({
      ...prev,
      pageSize
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
      filters: defaultFilters
    }));
  };

  return {
    preferences,
    updateFilters,
    updatePageSize,
    toggleAdvancedFilters,
    resetFilters,
  };
};
