
import { useState } from 'react';

export const useEmployeeSelection = () => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const addEmployeeToSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) ? prev : [...prev, employeeId]
    );
  };

  const removeEmployeeFromSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => prev.filter(id => id !== employeeId));
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const resetSelection = () => {
    setSelectedEmployeeIds([]);
  };

  return {
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    addEmployeeToSelection,
    removeEmployeeFromSelection,
    toggleEmployeeSelection,
    resetSelection,
  };
};
