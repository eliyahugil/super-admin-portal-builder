
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Employee, EmployeeType } from '@/types/supabase';

interface EmployeeProfileSidebarProps {
  employee: Employee;
}

const getEmployeeTypeLabel = (type: EmployeeType) => {
  const types: Record<EmployeeType, string> = {
    permanent: 'קבוע',
    temporary: 'זמני',
    youth: 'נוער',
    contractor: 'קבלן',
  };
  return types[type] || type;
};

const getEmployeeTypeVariant = (type: EmployeeType) => {
  const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    permanent: 'default',
    temporary: 'secondary',
    youth: 'outline',
    contractor: 'destructive',
  };
  return variants[type] || 'default';
};

export const EmployeeProfileSidebar: React.FC<EmployeeProfileSidebarProps> = ({ employee }) => {
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="md:w-1/3">
      <div className="bg-gray-100 rounded-md p-4">
        <div className="text-lg font-semibold">{employeeName}</div>
        <div className="text-sm text-gray-500">
          {employee.is_active ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              פעיל
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              לא פעיל
            </Badge>
          )}
        </div>
        {employee.employee_id && (
          <div className="flex items-center gap-2 mt-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{employee.employee_id}</span>
          </div>
        )}
        {employee.phone && (
          <div className="flex items-center gap-2 mt-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{employee.phone}</span>
          </div>
        )}
        {employee.email && (
          <div className="flex items-center gap-2 mt-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{employee.email}</span>
          </div>
        )}
        {employee.address && (
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{employee.address}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {employee.hire_date ? `התחיל ב- ${new Date(employee.hire_date).toLocaleDateString('he-IL')}` : 'לא הוגדר תאריך התחלה'}
          </span>
        </div>
        <Badge variant={getEmployeeTypeVariant(employee.employee_type)} className="mt-4">
          {getEmployeeTypeLabel(employee.employee_type)}
        </Badge>
      </div>
    </div>
  );
};
