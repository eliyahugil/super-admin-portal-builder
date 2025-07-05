
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { WeeklyScheduleView } from './schedule/WeeklyScheduleView';
import { MonthlyScheduleView } from './schedule/MonthlyScheduleView';
import { YearlyScheduleView } from './schedule/YearlyScheduleView';
import { ShiftScheduleFilters } from './schedule/ShiftScheduleFilters';
import { CreateShiftDialog } from './schedule/CreateShiftDialog';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { BulkShiftCreator } from './schedule/BulkShiftCreator';
import { ShiftAssignmentDialog } from './schedule/ShiftAssignmentDialog';
import { ScheduleErrorBoundary } from './schedule/ScheduleErrorBoundary';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { useCalendarIntegration } from './schedule/hooks/useCalendarIntegration';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScheduleHeader } from './schedule/components/ScheduleHeader';
import { ScheduleActions } from './schedule/components/ScheduleActions';
import { ScheduleStats } from './schedule/components/ScheduleStats';
import { HolidaysAndFestivalsTable } from './schedule/components/HolidaysAndFestivalsTable';
import { GoogleCalendarEventsTable } from './schedule/components/GoogleCalendarEventsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScheduleView, ShiftScheduleData } from './schedule/types';

export const ResponsiveShiftSchedule: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<ScheduleView>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftScheduleData | null>(null);
  const [assignmentShift, setAssignmentShift] = useState<ShiftScheduleData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

  const {
    currentDate,
    shifts,
    employees,
    branches,
    loading,
    error,
    filters,
    navigateDate,
    updateFilters,
    updateShift,
    deleteShift,
    createShift,
    businessId
  } = useShiftSchedule();

  // Use the integrated calendar hook
  const {
    combinedEvents,
    googleEvents,
    holidays,
    shabbatTimes,
    loading: calendarLoading,
    getEventsForDate
  } = useCalendarIntegration({
    businessId: businessId || '',
    shifts,
    employees
  });

  console.log('📊 ResponsiveShiftSchedule - Current state:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    combinedEventsCount: combinedEvents.length,
    googleEventsCount: googleEvents.length,
    holidaysCount: holidays.length,
    shabbatTimesCount: shabbatTimes.length,
    loading: loading || calendarLoading,
    error: error?.message || null,
    activeTab
  });

  // Handle retry for errors
  const handleRetry = () => {
    window.location.reload();
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen p-4">
        <ScheduleErrorBoundary 
          error={error} 
          onRetry={handleRetry}
          businessId={businessId}
        />
      </div>
    );
  }

  // Show loading state if no business context
  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען נתוני עסק...</p>
        </div>
      </div>
    );
  }

  const handleShiftClick = (shift: ShiftScheduleData) => {
    setSelectedShift(shift);
  };

  const handleShiftUpdate = async (shiftId: string, updates: Partial<ShiftScheduleData>) => {
    await updateShift(shiftId, updates);
    setSelectedShift(null);
  };

  const handleShiftDelete = async (shiftId: string) => {
    await deleteShift(shiftId);
    setSelectedShift(null);
  };

  const handleBulkCreate = async (shifts: Omit<ShiftScheduleData, 'id' | 'created_at'>[]) => {
    console.log('📝 Creating bulk shifts:', shifts.length);
    for (const shift of shifts) {
      await createShift(shift);
    }
  };

  const handleAssignEmployee = async (shiftId: string, employeeId: string) => {
    await updateShift(shiftId, { employee_id: employeeId });
    setAssignmentShift(null);
  };

  const handleUnassignEmployee = async (shiftId: string) => {
    await updateShift(shiftId, { employee_id: '' });
    setAssignmentShift(null);
  };

  const handleTabChange = (value: string) => {
    console.log('🔄 Tab changed to:', value);
    setActiveTab(value);
  };

  const isLoading = loading || calendarLoading;

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 lg:space-y-6 h-full flex flex-col`} dir="rtl">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>לוח משמרות</h1>
            <p className="text-gray-600 mt-1">ניהול וצפייה בלוח הזמנים עם אינטגרציית Google Calendar, חגים וזמני שבת</p>
          </div>
          
          <ScheduleActions
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            setShowCreateDialog={setShowCreateDialog}
            setShowBulkCreator={setShowBulkCreator}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <ScheduleStats shifts={shifts} isMobile={isMobile} />

      {/* Filters */}
      {showFilters && (
        <ShiftScheduleFilters
          filters={filters}
          onFiltersChange={updateFilters}
          employees={employees}
          branches={branches}
        />
      )}

      {/* Main Content with Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="schedule">לוח משמרות</TabsTrigger>
            <TabsTrigger value="holidays">חגים ומועדים</TabsTrigger>
            <TabsTrigger value="google-calendar">Google Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <ScheduleHeader
                  currentDate={currentDate}
                  view={view}
                  setView={setView}
                  navigateDate={navigateDate}
                  isMobile={isMobile}
                />
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">טוען נתוני משמרות ולוח שנה...</p>
                    </div>
                  </div>
                ) : view === 'week' ? (
                  <WeeklyScheduleView
                    shifts={shifts}
                    employees={employees}
                    currentDate={currentDate}
                    holidays={holidays}
                    shabbatTimes={shabbatTimes}
                    calendarEvents={combinedEvents}
                    onShiftClick={handleShiftClick}
                    onShiftUpdate={updateShift}
                  />
                ) : view === 'month' ? (
                  <MonthlyScheduleView
                    shifts={shifts}
                    employees={employees}
                    currentDate={currentDate}
                    holidays={holidays}
                    shabbatTimes={shabbatTimes}
                    calendarEvents={combinedEvents}
                    onShiftClick={handleShiftClick}
                    onShiftUpdate={updateShift}
                  />
                ) : (
                  <YearlyScheduleView
                    shifts={shifts}
                    employees={employees}
                    currentDate={currentDate}
                    holidays={holidays}
                    shabbatTimes={shabbatTimes}
                    calendarEvents={combinedEvents}
                    onShiftClick={handleShiftClick}
                    onShiftUpdate={updateShift}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="holidays" className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">טוען נתוני חגים ומועדים...</p>
                </div>
              </div>
            ) : (
              <HolidaysAndFestivalsTable 
                holidays={holidays}
                shabbatTimes={shabbatTimes}
                className="h-full"
              />
            )}
          </TabsContent>

          <TabsContent value="google-calendar" className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">טוען אירועי Google Calendar...</p>
                </div>
              </div>
            ) : (
              <GoogleCalendarEventsTable 
                events={googleEvents}
                businessId={businessId}
                className="h-full"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs max-w-xs opacity-75">
          <div>טאב פעיל: {activeTab}</div>
          <div>אירועים משולבים: {combinedEvents.length}</div>
          <div>Google Calendar: {googleEvents.length}</div>
          <div>חגים: {holidays.length}</div>
          <div>זמני שבת: {shabbatTimes.length}</div>
          <div>טוען: {isLoading ? 'כן' : 'לא'}</div>
        </div>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateShiftDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={createShift}
          employees={employees}
          branches={branches}
        />
      )}

      {showBulkCreator && (
        <BulkShiftCreator
          isOpen={showBulkCreator}
          onClose={() => setShowBulkCreator(false)}
          onSubmit={handleBulkCreate}
          employees={employees}
          branches={branches}
        />
      )}
      
      {selectedShift && (
        <ShiftDetailsDialog
          shift={selectedShift}
          employees={employees}
          branches={branches}
          onClose={() => setSelectedShift(null)}
          onUpdate={handleShiftUpdate}
          onDelete={handleShiftDelete}
          onAssignEmployee={(shift) => setAssignmentShift(shift)}
        />
      )}

      {assignmentShift && (
        <ShiftAssignmentDialog
          isOpen={!!assignmentShift}
          onClose={() => setAssignmentShift(null)}
          shift={assignmentShift}
          employees={employees}
          onAssign={handleAssignEmployee}
          onUnassign={handleUnassignEmployee}
        />
      )}
    </div>
  );
};
