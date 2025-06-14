
import React from 'react';
import { User, Phone, Mail, MapPin, Calendar, Clock, FileText, Building } from 'lucide-react';
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
    <div className="space-y-6" dir="rtl">
      {/* Main Info Card */}
      <div className="bg-gradient-to-l from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-right border-b border-blue-200 pb-3">
          סקירה כללית - {employeeName}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-right mb-3 border-b border-gray-200 pb-1">
              מידע אישי
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-700">{employeeName}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-600">שם מלא</span>
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              {employee.employee_id && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700">{employee.employee_id}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">מזהה עובד</span>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}

              {employee.phone && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700 font-mono" dir="ltr">{employee.phone}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">טלפון</span>
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}

              {employee.email && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700 font-mono" dir="ltr">{employee.email}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">אימייל</span>
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}

              {employee.address && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700">{employee.address}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">כתובת</span>
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-right mb-3 border-b border-gray-200 pb-1">
              מידע תעסוקתי
            </h4>
            <div className="space-y-3">
              {employee.hire_date && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700">
                    {new Date(employee.hire_date).toLocaleDateString('he-IL')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">תאריך התחלה</span>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}

              {employee.weekly_hours_required && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700">{employee.weekly_hours_required} שעות</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">שעות שבועיות נדרשות</span>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}

              {employee.main_branch && (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-gray-700">{employee.main_branch.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-600">סניף ראשי</span>
                    <Building className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {employee.notes && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-800 mb-2 text-right">הערות כלליות</h5>
            <div className="text-sm text-gray-700 text-right leading-relaxed">{employee.notes}</div>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-r-4 border-blue-500 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {employee.employee_notes?.length || 0}
            </div>
            <div className="text-sm font-medium text-blue-600">הערות</div>
          </div>
        </div>
        
        <div className="bg-white border-r-4 border-green-500 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {employee.employee_documents?.length || 0}
            </div>
            <div className="text-sm font-medium text-green-600">מסמכים</div>
          </div>
        </div>
        
        <div className="bg-white border-r-4 border-orange-500 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {employee.branch_assignments?.filter(ba => ba.is_active).length || 0}
            </div>
            <div className="text-sm font-medium text-orange-600">סניפים פעילים</div>
          </div>
        </div>
        
        <div className="bg-white border-r-4 border-purple-500 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {employee.weekly_tokens?.filter(t => t.is_active).length || 0}
            </div>
            <div className="text-sm font-medium text-purple-600">טוקנים פעילים</div>
          </div>
        </div>
      </div>
    </div>
  );
};
