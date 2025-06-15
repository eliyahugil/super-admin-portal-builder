
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeListItem } from './EmployeeListItem';
import { SelectedEmployeesList } from './SelectedEmployeesList';
import type { Employee, ExistingSignature } from './types';

interface EmployeeSelectorProps {
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeIds: string[];
  existingSignatures: ExistingSignature[];
  signatureUrls?: { [employeeId: string]: string };
  onEmployeeToggle: (employeeId: string) => void;
  onEmployeeRemove: (employeeId: string) => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  employeesLoading,
  selectedEmployeeIds,
  existingSignatures,
  signatureUrls = {},
  onEmployeeToggle,
  onEmployeeRemove
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

  console.log('👥 EmployeeSelector rendered:', {
    employeesCount: employees.length,
    selectedCount: selectedEmployeeIds.length,
    signatureUrlsCount: Object.keys(signatureUrls).length,
    existingSignaturesCount: existingSignatures.length,
    signatureUrlsData: signatureUrls,
    firstEmployee: employees[0]?.id,
    hasSignatureForFirst: employees[0] ? !!signatureUrls[employees[0].id] : false
  });

  if (employeesLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <span>טוען עובדים...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4 text-gray-500">
            לא נמצאו עובדים פעילים
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">בחר עובדים לשליחה:</h3>
        
        {/* רשימת עובדים זמינים */}
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

        {/* רשימת עובדים שנבחרו */}
        <SelectedEmployeesList
          selectedEmployeeIds={selectedEmployeeIds}
          employees={employees}
          signatureUrls={signatureUrls}
          onEmployeeRemove={onEmployeeRemove}
        />
      </CardContent>
    </Card>
  );
};
