
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Employee, EmployeeType } from '@/types/employee';

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
    <div className="md:w-1/3" dir="rtl">
      <div className="bg-gray-100 rounded-md p-4 text-right">
        <div className="text-lg font-semibold">{employeeName}</div>
        <div className="text-sm text-gray-500 mt-2">
          {employee.is_active ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 ml-1" />
              פעיל
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 ml-1" />
              לא פעיל
            </Badge>
          )}
        </div>
        {employee.employee_id && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span>{employee.employee_id}</span>
            <User className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {employee.phone && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span>{employee.phone}</span>
            <Phone className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {employee.email && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span>{employee.email}</span>
            <Mail className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {employee.address && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span>{employee.address}</span>
            <MapPin className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <div className="flex items-center gap-2 mt-2 justify-end">
          <span>
            {employee.hire_date ? `התחיל ב- ${new Date(employee.hire_date).toLocaleDateString('he-IL')}` : 'לא הוגדר תאריך התחלה'}
          </span>
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>
        <Badge variant={getEmployeeTypeVariant(employee.employee_type)} className="mt-4">
          {getEmployeeTypeLabel(employee.employee_type)}
        </Badge>
      </div>
    </div>
  );
};
