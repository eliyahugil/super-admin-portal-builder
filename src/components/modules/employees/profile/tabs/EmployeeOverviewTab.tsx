
import React from 'react';
import { User, Phone, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import type { Employee } from '@/types/supabase';

interface EmployeeOverviewTabProps {
  employee: Employee;
  employeeName: string;
}

export const EmployeeOverviewTab: React.FC<EmployeeOverviewTabProps> = ({
  employee,
  employeeName
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">סקירה כללית</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">שם מלא:</span>
              <span>{employeeName}</span>
            </div>
            {employee.employee_id && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">מזהה עובד:</span>
                <span>{employee.employee_id}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">טלפון:</span>
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">אימייל:</span>
                <span>{employee.email}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {employee.hire_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">תאריך התחלה:</span>
                <span>{new Date(employee.hire_date).toLocaleDateString('he-IL')}</span>
              </div>
            )}
            {employee.weekly_hours_required && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">שעות שבועיות:</span>
                <span>{employee.weekly_hours_required}</span>
              </div>
            )}
            {employee.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">כתובת:</span>
                <span>{employee.address}</span>
              </div>
            )}
          </div>
        </div>
        
        {employee.notes && (
          <div className="mt-4 p-4 bg-white rounded border">
            <div className="text-sm font-semibold mb-2">הערות כלליות:</div>
            <div className="text-sm text-gray-700">{employee.notes}</div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {employee.employee_notes?.length || 0}
          </div>
          <div className="text-sm text-blue-600">הערות</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {employee.employee_documents?.length || 0}
          </div>
          <div className="text-sm text-green-600">מסמכים</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {employee.branch_assignments?.filter(ba => ba.is_active).length || 0}
          </div>
          <div className="text-sm text-orange-600">סניפים פעילים</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {employee.weekly_tokens?.filter(t => t.is_active).length || 0}
          </div>
          <div className="text-sm text-purple-600">טוקנים פעילים</div>
        </div>
      </div>
    </div>
  );
};
