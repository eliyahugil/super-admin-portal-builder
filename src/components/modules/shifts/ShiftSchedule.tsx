
import React from 'react';
import { ShiftScheduleHeader } from './schedule/ShiftScheduleHeader';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { ShiftScheduleView } from './schedule/ShiftScheduleView';
import { ScheduleFilters } from './schedule/ScheduleFilters';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { CreateShiftDialog } from './schedule/CreateShiftDialog';
import { PendingSubmissionsDialog } from './schedule/PendingSubmissionsDialog';

export const ShiftSchedule: React.FC = () => {
  const {
    currentDate,
    shifts,
    employees,
    branches,
    pendingSubmissions,
    loading,
    error,
    filters,
    navigateDate,
    updateFilters,
    updateShift,
    deleteShift,
    createShift,
    businessId,
    refetchShifts
  } = useShiftSchedule();

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
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <ShiftScheduleHeader 
        currentDate={currentDate}
        totalShifts={shifts.length}
        totalEmployees={employees.length}
        totalBranches={branches.length}
      />
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-80">
          <ScheduleFilters 
            filters={filters} 
            onFiltersChange={updateFilters} 
            employees={employees} 
            branches={branches} 
          />
        </div>

        <div className="flex-1">
          <ShiftScheduleView
            shifts={shifts}
            employees={employees}
            branches={branches}
            currentDate={currentDate}
            onShiftClick={(shift) => {
              console.log('Shift clicked:', shift);
            }}
            onShiftUpdate={updateShift}
            onAddShift={(date) => {
              console.log('Add shift for date:', date);
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
          />
        </div>
      </div>

      <ShiftDetailsDialog />
      <CreateShiftDialog onCreate={createShift} />
      <PendingSubmissionsDialog />
    </div>
  );
};
