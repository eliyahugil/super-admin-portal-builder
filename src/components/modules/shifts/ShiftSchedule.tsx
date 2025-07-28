
import React from 'react';
import { ShiftScheduleHeader } from './schedule/ShiftScheduleHeader';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { ShiftScheduleView } from './schedule/ShiftScheduleView';
import { ScheduleFilters } from './schedule/ScheduleFilters';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { CreateShiftDialog } from './schedule/CreateShiftDialog';
import { PendingSubmissionsDialog } from './schedule/PendingSubmissionsDialog';

export const ShiftSchedule: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState<any>(null);
  const [showShiftDetails, setShowShiftDetails] = React.useState(false);
  
  const {
    currentDate,
    selectedWeek,
    shifts,
    employees,
    branches,
    pendingSubmissions,
    loading,
    error,
    filters,
    navigateDate,
    navigateWeek,
    setSelectedWeek,
    updateFilters,
    updateShift,
    deleteShift,
    createShift,
    businessId,
    refetchShifts
  } = useShiftSchedule();

  // פונקציה לשיבוץ עובד למשמרת
  const handleAssignEmployee = async (employeeId: string, shiftId: string) => {
    try {
      await updateShift(shiftId, { employee_id: employeeId });
    } catch (error) {
      console.error('Error assigning employee:', error);
      throw error;
    }
  };

  // פונקציות לסינון מהיר - עודכן לעבוד עם הטיפוס הנכון
  const handleQuickFilter = (type: 'today' | 'tomorrow' | 'this_week' | 'next_week') => {
    // Use the dateFilter functionality from the hook instead of direct filter updates
    // This will be handled by the ShiftScheduleFilters hook
    console.log('Quick filter:', type);
  };

  const handleResetFilters = () => {
    updateFilters({
      status: 'all',
      employee: 'all',
      branch: 'all',
      role: 'all',
      date: undefined
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">שגיאה בטעינת נתוני המשמרות</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-2 sm:px-4 py-4 sm:py-8" dir="rtl">
      <ShiftScheduleHeader 
        currentDate={currentDate}
        totalShifts={shifts.length}
        totalEmployees={employees.length}
        totalBranches={branches.length}
      />
      
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="w-full xl:w-80 shrink-0">
          <ScheduleFilters 
            filters={filters} 
            onFiltersChange={updateFilters} 
            employees={employees} 
            branches={branches} 
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <ShiftScheduleView
            shifts={shifts}
            employees={employees}
            branches={branches}
            currentDate={currentDate}
            onShiftClick={(shift) => {
              setSelectedShift(shift);
              setShowShiftDetails(true);
            }}
            onShiftUpdate={updateShift}
            onAddShift={(date) => {
              setShowCreateDialog(true);
            }}
            onShiftDelete={deleteShift}
            businessId={businessId}
            onShowPendingSubmissions={() => {
              console.log('Show pending submissions');
            }}
            holidays={[]}
            shabbatTimes={[]}
            calendarEvents={[]}
            pendingSubmissions={pendingSubmissions}
            onWeekDeleted={refetchShifts}
            // הוספת הפרופס החדשים
            filters={filters}
            onFiltersChange={updateFilters}
            onQuickFilter={handleQuickFilter}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>

      <ShiftDetailsDialog 
        shift={selectedShift}
        open={showShiftDetails}
        onClose={() => setShowShiftDetails(false)}
        onUpdate={updateShift}
        onDelete={deleteShift}
        onAssignEmployee={handleAssignEmployee}
      />
      <CreateShiftDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={createShift} 
      />
      <PendingSubmissionsDialog />
    </div>
  );
};
