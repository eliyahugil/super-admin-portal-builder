
import React from 'react';
import { SelectedEmployeesList } from './SelectedEmployeesList';
import type { Employee } from './types';

interface SelectedEmployeesDisplayProps {
  selectedEmployeeIds: string[];
  employees: Employee[];
  signatureUrls: { [employeeId: string]: string };
  onEmployeeRemove: (employeeId: string) => void;
}

export const SelectedEmployeesDisplay: React.FC<SelectedEmployeesDisplayProps> = ({
  selectedEmployeeIds,
  employees,
  signatureUrls,
  onEmployeeRemove
}) => {
  return (
    <SelectedEmployeesList
      selectedEmployeeIds={selectedEmployeeIds}
      employees={employees}
      signatureUrls={signatureUrls}
      onEmployeeRemove={onEmployeeRemove}
    />
  );
};
