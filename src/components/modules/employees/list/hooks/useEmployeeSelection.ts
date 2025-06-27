
import { useState } from 'react';
import type { Employee } from '@/types/employee';

export const useEmployeeSelection = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = (employees: Employee[], checked: boolean) => {
    if (checked) {
      const allIds = new Set(employees.map(emp => emp.id));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const clearSelectedEmployees = () => {
    setSelectedEmployees(new Set());
  };

  return {
    selectedEmployees,
    handleSelectEmployee,
    handleSelectAll,
    clearSelectedEmployees,
    setSelectedEmployees,
  };
};
