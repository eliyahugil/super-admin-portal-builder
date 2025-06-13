
import React from 'react';
import { EmployeeTokenManager } from './EmployeeTokenManager';

interface EmployeeTokenButtonProps {
  employeeId: string;
  employeeName: string;
  phone: string | null;
  email: string | null;
  onTokenSent: () => void;
  size?: 'sm' | 'default' | 'lg';
}

export const EmployeeTokenButton: React.FC<EmployeeTokenButtonProps> = ({
  employeeId,
  employeeName,
  phone,
  email,
  onTokenSent,
  size = 'sm'
}) => {
  return (
    <EmployeeTokenManager
      employeeId={employeeId}
      employeeName={employeeName}
      phone={phone}
      onTokenSent={onTokenSent}
    />
  );
};
