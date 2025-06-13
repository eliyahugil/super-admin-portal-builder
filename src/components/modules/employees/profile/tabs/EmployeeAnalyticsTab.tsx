
import React from 'react';
import type { Employee } from '@/types/supabase';

interface EmployeeAnalyticsTabProps {
  employee: Employee;
}

export const EmployeeAnalyticsTab: React.FC<EmployeeAnalyticsTabProps> = ({
  employee
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">ניתוחים וסטטיסטיקות</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">נוכחות חודשית</h4>
          <div className="text-2xl font-bold text-green-600">95%</div>
          <div className="text-sm text-gray-500">ממוצע 3 חודשים אחרונים</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">הגשות בזמן</h4>
          <div className="text-2xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-gray-500">משמרות הוגשו בזמן</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">שעות עבודה</h4>
          <div className="text-2xl font-bold text-purple-600">
            {employee.weekly_hours_required || 0}
          </div>
          <div className="text-sm text-gray-500">שעות שבועיות נדרשות</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">משמרות חודשיות</h4>
          <div className="text-2xl font-bold text-orange-600">18</div>
          <div className="text-sm text-gray-500">ממוצע משמרות לחודש</div>
        </div>
      </div>
    </div>
  );
};
