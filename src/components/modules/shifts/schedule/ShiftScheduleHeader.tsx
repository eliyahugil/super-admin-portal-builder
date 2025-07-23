
import React from 'react';
import { Calendar, Users, Building, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';

interface ShiftScheduleHeaderProps {
  currentDate: Date;
  totalShifts: number;
  totalEmployees: number;
  totalBranches: number;
}

export const ShiftScheduleHeader: React.FC<ShiftScheduleHeaderProps> = ({
  currentDate,
  totalShifts,
  totalEmployees,
  totalBranches
}) => {
  const { isEmployee, employeeId, assignedBranchIds } = useEmployeeContext();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לוח משמרות</h1>
          <p className="text-gray-600">
            {currentDate.toLocaleDateString('he-IL', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {totalShifts} משמרות
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalEmployees} עובדים
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            {totalBranches} סניפים
          </Badge>
        </div>
      </div>

      {/* Employee context info */}
      {isEmployee && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>תצוגת עובד:</strong> אתה רואה רק משמרות וסניפים שאתה משויך אליהם
            {assignedBranchIds.length > 0 && (
              <span className="block mt-1 text-sm">
                משויך ל-{assignedBranchIds.length} סניפים
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
