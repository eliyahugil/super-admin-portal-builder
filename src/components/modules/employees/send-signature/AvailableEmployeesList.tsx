
import React from 'react';
import { EmployeeListItem } from './EmployeeListItem';
import type { Employee, ExistingSignature } from './types';

interface AvailableEmployeesListProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  existingSignatures: ExistingSignature[];
  signatureUrls: { [employeeId: string]: string };
  onEmployeeToggle: (employeeId: string) => void;
}

export const AvailableEmployeesList: React.FC<AvailableEmployeesListProps> = ({
  employees,
  selectedEmployeeIds,
  existingSignatures,
  signatureUrls,
  onEmployeeToggle
}) => {
  const getEmployeeSignatureStatus = (employeeId: string) => {
    const signature = existingSignatures.find(sig => sig.employee_id === employeeId);
    if (!signature) return null;
    
    return {
      status: signature.status,
      signed_at: signature.signed_at,
      sent_at: signature.sent_at
    };
  };

  return (
    <div className="space-y-2 mb-4">
      {employees.map((employee) => {
        const isSelected = selectedEmployeeIds.includes(employee.id);
        const signatureStatus = getEmployeeSignatureStatus(employee.id);
        const signatureUrl = signatureUrls[employee.id];

        return (
          <EmployeeListItem
            key={employee.id}
            employee={employee}
            isSelected={isSelected}
            signatureUrl={signatureUrl}
            signatureStatus={signatureStatus}
            onToggle={onEmployeeToggle}
          />
        );
      })}
    </div>
  );
};
