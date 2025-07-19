import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, User, Clock, CheckCircle } from 'lucide-react';
import type { ShiftScheduleData, Employee } from '../types';

interface AutoAssignmentHelperProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  existingShifts: ShiftScheduleData[];
  pendingSubmissions: any[];
  onAutoAssign: (shiftId: string, employeeId: string) => void;
}

export const AutoAssignmentHelper: React.FC<AutoAssignmentHelperProps> = ({
  shift,
  employees,
  existingShifts,
  pendingSubmissions,
  onAutoAssign
}) => {
  console.log('⚡ AutoAssignmentHelper rendered for shift:', {
    shiftId: shift.id,
    shiftDate: shift.shift_date,
    shiftTime: `${shift.start_time}-${shift.end_time}`,
    employeesCount: employees.length,
    pendingSubmissionsCount: pendingSubmissions.length,
    hasEmployee: !!shift.employee_id
  });

  // מציאת עובדים שהגישו בקשה למשמרת זו
  const getEligibleEmployees = () => {
    const eligible: Array<{
      employee: Employee;
      hasSubmission: boolean;
      hasConflict: boolean;
      submissionData?: any;
    }> = [];

    // בדיקת עובדים עם הגשות
    pendingSubmissions.forEach(submission => {
      if (submission.shift_requests) {
        submission.shift_requests.forEach((request: any) => {
          if (
            request.shift_date === shift.shift_date &&
            request.branch_id === shift.branch_id &&
            request.start_time === shift.start_time &&
            request.end_time === shift.end_time
          ) {
            const employee = employees.find(emp => emp.id === submission.employee_id);
            if (employee) {
              const hasConflict = checkTimeConflict(employee.id, shift);
              eligible.push({
                employee,
                hasSubmission: true,
                hasConflict,
                submissionData: submission
              });
            }
          }
        });
      }
    });

    return eligible.filter(item => !item.hasConflict); // רק עובדים ללא קונפליקט
  };

  // בדיקת קונפליקט זמן
  const checkTimeConflict = (employeeId: string, newShift: ShiftScheduleData) => {
    return existingShifts.some(existingShift => 
      existingShift.employee_id === employeeId &&
      existingShift.shift_date === newShift.shift_date &&
      existingShift.id !== newShift.id &&
      (
        (newShift.start_time >= existingShift.start_time && newShift.start_time < existingShift.end_time) ||
        (newShift.end_time > existingShift.start_time && newShift.end_time <= existingShift.end_time) ||
        (newShift.start_time <= existingShift.start_time && newShift.end_time >= existingShift.end_time)
      )
    );
  };

  const eligibleEmployees = getEligibleEmployees();

  // אם המשמרת כבר מוקצית או אין עובדים זכאים
  if (shift.employee_id || eligibleEmployees.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
          <Zap className="h-4 w-4" />
          שיבוץ אוטומטי זמין
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-blue-700">
            נמצאו {eligibleEmployees.length} עובדים שהגישו בקשה למשמרת זו וזמינים:
          </p>
          
          <div className="space-y-2">
            {eligibleEmployees.slice(0, 3).map(({ employee, submissionData }) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-medium">
                    {employee.first_name} {employee.last_name}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                    <CheckCircle className="h-2 w-2 mr-1" />
                    הגיש בקשה
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onAutoAssign(shift.id, employee.id)}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  שבץ
                </Button>
              </div>
            ))}
          </div>

          {eligibleEmployees.length > 3 && (
            <p className="text-xs text-blue-600">
              ועוד {eligibleEmployees.length - 3} עובדים נוספים...
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Clock className="h-3 w-3" />
            <span>כל העובדים המוצגים זמינים באותן שעות</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};