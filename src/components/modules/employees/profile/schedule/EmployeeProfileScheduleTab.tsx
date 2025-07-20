import React from 'react';
import { EmployeeScheduleView } from './EmployeeScheduleView';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface EmployeeProfileScheduleTabProps {
  employee: Employee;
}

export const EmployeeProfileScheduleTab: React.FC<EmployeeProfileScheduleTabProps> = ({ employee }) => {
  return <EmployeeScheduleView employee={employee} />;
};