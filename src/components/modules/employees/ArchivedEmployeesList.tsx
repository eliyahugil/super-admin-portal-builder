
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Building } from 'lucide-react';
import { GenericArchivedList } from '@/components/shared/GenericArchivedList';
import type { Employee, EmployeeType } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface ArchivedEmployeesListProps {
  employees: Employee[];
  onRefetch: () => void;
  branches: Branch[];
}

export const ArchivedEmployeesList: React.FC<ArchivedEmployeesListProps> = ({ 
  employees, 
  onRefetch, 
  branches 
}) => {
  const getEmployeeTypeLabel = (type: EmployeeType) => {
    const types: Record<EmployeeType, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type];
  };

  const getEmployeeTypeVariant = (type: EmployeeType) => {
    const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type];
  };

  const renderEmployeeCard = (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    return (
      <>
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-gray-900">{employeeName}</h4>
          <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
            {getEmployeeTypeLabel(employee.employee_type)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {employee.employee_id && (
            <span>מספר עובד: {employee.employee_id}</span>
          )}
          
          {employee.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{employee.phone}</span>
            </div>
          )}
          
          {employee.main_branch && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{employee.main_branch.name}</span>
            </div>
          )}
        </div>
        
        {employee.hire_date && (
          <div className="text-xs text-gray-500 mt-1">
            התחיל עבודה: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
          </div>
        )}
      </>
    );
  };

  return (
    <GenericArchivedList
      tableName="employees"
      entityName="העובד"
      entityNamePlural="עובדים"
      queryKey={['employees']}
      getEntityDisplayName={(emp: Employee) => `${emp.first_name} ${emp.last_name}`}
      renderEntityCard={renderEmployeeCard}
      select={`
        *,
        main_branch:branches!main_branch_id(
          id,
          name,
          address
        )
      `}
    />
  );
};
