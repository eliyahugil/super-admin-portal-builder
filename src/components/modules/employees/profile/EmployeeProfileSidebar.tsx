
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
    <div className="md:w-1/3 space-y-6" dir="rtl">
      {/* Employee Name and Status */}
      <div className="bg-gradient-to-l from-blue-50 to-white rounded-lg p-6 text-right border border-blue-100">
        <div className="text-2xl font-bold text-gray-900 mb-3">{employeeName}</div>
        <div className="flex justify-end mb-4">
          {employee.is_active ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
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
        <Badge variant={getEmployeeTypeVariant(employee.employee_type)} className="text-sm">
          {getEmployeeTypeLabel(employee.employee_type)}
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-right">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">פרטי התקשרות</h3>
        <div className="space-y-3">
          {employee.employee_id && (
            <div className="flex items-center justify-end gap-3">
              <span className="text-gray-700">{employee.employee_id}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">מזהה עובד</span>
                <User className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center justify-end gap-3">
              <span className="text-gray-700 font-mono" dir="ltr">{employee.phone}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">טלפון</span>
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          {employee.email && (
            <div className="flex items-center justify-end gap-3">
              <span className="text-gray-700 font-mono" dir="ltr">{employee.email}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">אימייל</span>
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          {employee.address && (
            <div className="flex items-center justify-end gap-3">
              <span className="text-gray-700">{employee.address}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">כתובת</span>
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-right">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">מידע תעסוקתי</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-end gap-3">
            <span className="text-gray-700">
              {employee.hire_date 
                ? new Date(employee.hire_date).toLocaleDateString('he-IL')
                : 'לא הוגדר'
              }
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-500">תאריך התחלה</span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {employee.weekly_hours_required && (
            <div className="flex items-center justify-end gap-3">
              <span className="text-gray-700">{employee.weekly_hours_required} שעות</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">שעות שבועיות</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">
            {employee.employee_notes?.length || 0}
          </div>
          <div className="text-sm text-blue-600 font-medium">הערות</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
          <div className="text-2xl font-bold text-green-600">
            {employee.employee_documents?.length || 0}
          </div>
          <div className="text-sm text-green-600 font-medium">מסמכים</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-100">
          <div className="text-2xl font-bold text-orange-600">
            {employee.branch_assignments?.filter(ba => ba.is_active).length || 0}
          </div>
          <div className="text-sm text-orange-600 font-medium">סניפים</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">
            {employee.weekly_tokens?.filter(t => t.is_active).length || 0}
          </div>
          <div className="text-sm text-purple-600 font-medium">טוקנים</div>
        </div>
      </div>
    </div>
  );
};
