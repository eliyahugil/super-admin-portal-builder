
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface EmployeeSalaryTabProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeSalaryTab: React.FC<EmployeeSalaryTabProps> = ({
  employeeId,
  employeeName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          היסטוריית שכר
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתוני שכר</h3>
          <p className="text-gray-500">לא הוגדרו נתוני שכר עבור עובד זה</p>
        </div>
      </CardContent>
    </Card>
  );
};
