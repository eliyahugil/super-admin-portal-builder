
import React from 'react';
import { GenericArchiveButton } from '@/components/shared/GenericArchiveButton';
import type { Employee } from '@/types/employee';

interface EmployeeArchiveButtonProps {
  employee: Employee;
  isArchived?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  onSuccess?: () => void;
}

export const EmployeeArchiveButton: React.FC<EmployeeArchiveButtonProps> = ({
  employee,
  isArchived = false,
  variant = 'outline',
  size = 'sm',
  onSuccess
}) => {
  return (
    <GenericArchiveButton
      entity={employee}
      tableName="employees"
      entityName="העובד"
      queryKey={['employees']}
      getEntityDisplayName={(emp) => `${emp.first_name} ${emp.last_name}`}
      isArchived={isArchived}
      variant={variant}
      size={size}
      onSuccess={onSuccess}
    />
  );
};
