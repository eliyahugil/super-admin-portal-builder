import React, { useState } from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Filter, Eye, EyeOff } from 'lucide-react';
import { ShiftScheduleViewProps, PendingSubmission } from './types';
import { ShiftSubmissionReminderButton } from './components/ShiftSubmissionReminderButton';
import { BulkWeekDeleteDialog } from './components/BulkWeekDeleteDialog';
import { MobileShiftScheduleView } from './components/MobileShiftScheduleView';

export const ShiftScheduleView: React.FC<ShiftScheduleViewProps & { onWeekDeleted?: () => void }> = (props) => {
  const { type: deviceType } = useDeviceType();
  
  // If mobile, use the mobile-optimized view
  if (deviceType === 'mobile') {
    return <MobileShiftScheduleView {...props} />;
  }

  const {
    shifts,
    employees,
    branches,
    currentDate,
    holidays,
    shabbatTimes,
    calendarEvents,
    pendingSubmissions = [],
    businessId,
    onShiftClick,
    onShiftUpdate,
    onAddShift,
    onShiftDelete,
    isSelectionMode,
    selectedShifts,
    onShiftSelection,
    onShowPendingSubmissions,
    onWeekDeleted,
  } = props;

  const [showNewShifts, setShowNewShifts] = useState(true);

  // Safely handle pendingSubmissions - ensure it's an array of proper type
  const safePendingSubmissions: PendingSubmission[] = Array.isArray(pendingSubmissions) 
    ? pendingSubmissions.filter((sub): sub is PendingSubmission => sub != null)
    : [];

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, typeof shifts>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'לא משויך';
    const employee = employees.find(emp => emp.id === employeeId);
    
    // Temporary debug log to check data
    if (!employee && employeeId) {
      console.log('⚠️ Employee not found:', { 
        employeeId, 
        availableEmployees: employees.map(e => ({ id: e.id, name: `${e.first_name} ${e.last_name}` }))
      });
    }
    
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">לוח משמרות</h2>
              <p className="text-sm text-gray-600">
                {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewShifts(!showNewShifts)}
            >
              {showNewShifts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showNewShifts ? 'הסתר חדשות' : 'הצג חדשות'}
            </Button>

            {safePendingSubmissions.length > 0 && onShowPendingSubmissions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPendingSubmissions}
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                <Filter className="h-4 w-4" />
                הגשות ממתינות ({safePendingSubmissions.length})
              </Button>
            )}

            <BulkWeekDeleteDialog onSuccess={onWeekDeleted} businessId={businessId} />

            <Button
              size="sm"
              onClick={() => onAddShift(currentDate)}
            >
              <Plus className="h-4 w-4" />
              הוסף משמרת
            </Button>
          </div>
        </div>

        {/* Shift Submission Reminder Section */}
        <ShiftSubmissionReminderButton 
          employees={employees}
          businessId={businessId}
        />
      </div>

      {/* Shifts Display */}
      <div className="space-y-4">
        {Object.keys(shiftsByDate).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין משמרות להצגה</h3>
              <p className="text-gray-600 mb-4">לא נמצאו משמרות בתקופה הנבחרת</p>
              <Button onClick={() => onAddShift(currentDate)}>
                <Plus className="h-4 w-4 mr-2" />
                הוסף משמרת ראשונה
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(shiftsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayShifts]) => (
              <Card key={date} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{formatDate(date)}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {dayShifts.length} משמרות
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {dayShifts.map((shift, index) => (
                      <div
                        key={shift.id}
                        className={`p-4 border-r-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          shift.is_new && showNewShifts ? 'border-r-blue-500 bg-blue-50' : 'border-r-gray-200'
                        } ${
                          selectedShifts?.some(s => s.id === shift.id) ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => {
                          if (isSelectionMode && onShiftSelection) {
                            onShiftSelection(shift, !selectedShifts?.some(s => s.id === shift.id));
                          } else {
                            onShiftClick(shift);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-medium">
                                {shift.start_time} - {shift.end_time}
                              </span>
                              <span className="text-sm text-gray-600">
                                {getEmployeeName(shift.employee_id)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {getBranchName(shift.branch_id)}
                              </span>
                              {shift.role && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {shift.role}
                                </span>
                              )}
                            </div>
                            {shift.notes && (
                              <p className="text-sm text-gray-600">{shift.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {shift.is_new && showNewShifts && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                חדש
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              shift.status === 'approved' ? 'bg-green-100 text-green-800' :
                              shift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shift.status === 'approved' ? 'מאושר' : 
                               shift.status === 'pending' ? 'ממתין' : shift.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};
