import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, UserX, Archive, AlertTriangle } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeeStatusBadgeProps {
  employee: Employee;
  size?: 'sm' | 'default';
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({ 
  employee, 
  size = 'default' 
}) => {
  const getStatusConfig = () => {
    if (employee.is_archived) {
      return {
        text: 'ארכיון',
        variant: 'secondary' as const,
        icon: Archive,
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      };
    }
    
    if (!employee.is_active) {
      return {
        text: 'לא פעיל',
        variant: 'destructive' as const,
        icon: UserX,
        className: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      };
    }
    
    return {
      text: 'פעיל',
      variant: 'default' as const,
      icon: User,
      className: 'bg-green-100 text-green-700 hover:bg-green-200'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-1' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {config.text}
    </Badge>
  );
};