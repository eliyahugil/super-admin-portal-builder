
import { useState } from 'react';
import { FiltersState } from '../types';

export const useFilesState = () => {
  const [filters, setFilters] = useState<FiltersState>({
    searchTerm: '',
    dateFilter: '',
    fileTypeFilter: '',
  });

  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  const toggleEmployeeExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dateFilter: '',
      fileTypeFilter: '',
    });
  };

  return {
    filters,
    setFilters,
    expandedEmployees,
    toggleEmployeeExpansion,
    clearFilters,
  };
};
