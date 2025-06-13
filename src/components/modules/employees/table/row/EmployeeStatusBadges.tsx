
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmployeeStatusBadgesProps {
  isActive: boolean;
  employeeType: string;
}

const getEmployeeTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    permanent: 'קבוע',
    temporary: 'זמני',
    youth: 'נוער',
    contractor: 'קבלן',
  };
  return types[type] || type;
};

const getEmployeeTypeVariant = (type: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    permanent: 'default',
    temporary: 'secondary',
    youth: 'outline',
    contractor: 'destructive',
  };
  return variants[type] || 'default';
};

export const EmployeeStatusBadges: React.FC<EmployeeStatusBadgesProps> = ({
  isActive,
  employeeType
}) => {
  return (
    <div className="space-y-1">
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'פעיל' : 'לא פעיל'}
      </Badge>
      <Badge variant={getEmployeeTypeVariant(employeeType)}>
        {getEmployeeTypeLabel(employeeType)}
      </Badge>
    </div>
  );
};
