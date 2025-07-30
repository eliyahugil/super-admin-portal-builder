
import React from 'react';
import { Calendar, Users, Building, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployeeContext } from '@/hooks/useEmployeeContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { BulkShiftCreator } from './components/BulkShiftCreator';

interface ShiftScheduleHeaderProps {
  currentDate: Date;
  totalShifts: number;
  totalEmployees: number;
  totalBranches: number;
  onAddShift?: () => void;
  onRefresh?: () => void;
}

export const ShiftScheduleHeader: React.FC<ShiftScheduleHeaderProps> = ({
  currentDate,
  totalShifts,
  totalEmployees,
  totalBranches,
  onAddShift,
  onRefresh
}) => {
  const { isEmployee, employeeId, assignedBranchIds } = useEmployeeContext();
  const { businessId } = useCurrentBusiness();

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

        {/* כפתורי פעולה וסטטיסטיקות */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
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

          {/* כפתורי פעולה - רק למנהלים */}
          {!isEmployee && businessId && (
            <div className="flex gap-2">
              {onAddShift && (
                <Button 
                  onClick={onAddShift}
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  הוסף משמרת
                </Button>
              )}
              
              <BulkShiftCreator 
                businessId={businessId}
                onSuccess={onRefresh}
              />
            </div>
          )}
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
