import React from 'react';
import { KeyRound, Star } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeeTokensTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeTokensTab: React.FC<EmployeeTokensTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  console.log('🎯 EmployeeTokensTab נטען! employeeId:', employeeId);
  
  return (
    <div className="p-8 bg-white min-h-[500px]" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <KeyRound className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              טוקן אישי להגשת משמרות
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            עובד: <span className="font-semibold">{employeeName}</span>
          </p>
          <p className="text-sm text-gray-500">
            מזהה עובד: {employeeId}
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">הטאב עובד בהצלחה!</h3>
              <p className="text-green-700">המערכת טוענת כרגע את הטוקנים...</p>
            </div>
          </div>
        </div>

        {/* Permanent Token Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">טוקן קבוע</h2>
          </div>
          <p className="text-gray-700 mb-4">
            טוקן זה יאפשר לעובד להגיש משמרות ולצפות בסידור העבודה שלו בכל עת.
          </p>
          <div className="bg-white border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
            <KeyRound className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">
              הטוקן הקבוע יופיע כאן לאחר יצירתו
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};