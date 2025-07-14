import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { WeeklyScheduleView } from './schedule/WeeklyScheduleView';
import { MonthlyScheduleView } from './schedule/MonthlyScheduleView';
import { YearlyScheduleView } from './schedule/YearlyScheduleView';
import { ShiftScheduleFilters } from './schedule/ShiftScheduleFilters';
import { UnifiedShiftCreator } from './schedule/UnifiedShiftCreator';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { QuickMultipleShiftsDialog } from './schedule/QuickMultipleShiftsDialog';
import { ShiftAssignmentDialog } from './schedule/ShiftAssignmentDialog';
import { ShiftTemplatesApplyDialog } from './schedule/components/ShiftTemplatesApplyDialog';
import { ScheduleErrorBoundary } from './schedule/ScheduleErrorBoundary';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { useCalendarIntegration } from './schedule/hooks/useCalendarIntegration';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScheduleHeader } from './schedule/components/ScheduleHeader';
import { ScheduleActions } from './schedule/components/ScheduleActions';
import { ScheduleStats } from './schedule/components/ScheduleStats';
import { HolidaysAndFestivalsTable } from './schedule/components/HolidaysAndFestivalsTable';
import { GoogleCalendarEventsTable } from './schedule/components/GoogleCalendarEventsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScheduleView, ShiftScheduleData, CreateShiftData } from './schedule/types';

export const ResponsiveShiftSchedule: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<ScheduleView>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuickMultiple, setShowQuickMultiple] = useState(false);
  const [quickMultipleShift, setQuickMultipleShift] = useState<Partial<CreateShiftData> | undefined>();
  const [selectedShift, setSelectedShift] = useState<ShiftScheduleData | null>(null);
  const [assignmentShift, setAssignmentShift] = useState<ShiftScheduleData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [templatesSelectedDate, setTemplatesSelectedDate] = useState<Date | undefined>();

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
    businessId
  } = useShiftSchedule();

  const queryClient = useQueryClient();

  // Use the integrated calendar hook with correct parameters
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

  const handleAddShift = (date: Date) => {
    console.log('🔄 Opening create shift dialog for date:', date);
    setShowCreateDialog(true);
  };

  const handleApplyTemplates = (date?: Date) => {
    setTemplatesSelectedDate(date);
    setShowTemplatesDialog(true);
  };

  const handleShiftUpdate = async (shiftId: string, updates: Partial<ShiftScheduleData>) => {
    await updateShift(shiftId, updates);
    setSelectedShift(null);
  };

  const handleShiftDelete = async (shiftId: string) => {
    await deleteShift(shiftId);
    setSelectedShift(null);
  };

  const handleCreateShift = async (shiftData: CreateShiftData) => {
    console.log('📝 Creating single shift:', shiftData);
    await createShift(shiftData);
  };

  const handleCreateMultipleShifts = async (shifts: CreateShiftData[]) => {
    console.log('📝 Creating multiple shifts:', shifts.length);
    for (const shift of shifts) {
      await createShift(shift);
    }
  };

  const handleBulkCreate = async (shifts: Omit<ShiftScheduleData, 'id' | 'created_at' | 'updated_at' | 'business_id' | 'is_assigned' | 'is_archived'>[]) => {
    console.log('📝 Creating bulk shifts:', shifts.length);
    for (const shift of shifts) {
      await createShift(shift);
    }
  };

  const handleDuplicateShift = (shift: ShiftScheduleData) => {
    setQuickMultipleShift({
      start_time: shift.start_time,
      end_time: shift.end_time,
      employee_id: shift.employee_id,
      branch_id: shift.branch_id,
      role: shift.role
    });
    setShowQuickMultiple(true);
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

  const handleBranchCreated = () => {
    // Invalidate and refetch branches data
    queryClient.invalidateQueries({ queryKey: ['schedule-branches', businessId] });
  };

  const isLoading = loading || calendarLoading;

  return (
    <div className={`${isMobile ? 'p-2' : 'p-6'} space-y-2 lg:space-y-6 h-full flex flex-col overflow-hidden`} dir="rtl">
      {/* Mobile optimized header */}
      <div className="flex flex-col space-y-2">
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900`}>לוח משמרות</h1>
            {!isMobile && <p className="text-gray-600 mt-1">ניהול וצפייה בלוח הזמנים עם אינטגרציית Google Calendar, חגים וזמני שבת</p>}
          </div>
          
          <ScheduleActions
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            setShowCreateDialog={setShowCreateDialog}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            isMobile={isMobile}
          />
          
          {/* Templates and Quick Multiple Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleApplyTemplates()}
              variant="outline"
              size={isMobile ? "sm" : "default"}
            >
              <FileText className="h-4 w-4 ml-1" />
              תבניות משמרות
            </Button>
            <Button
              onClick={() => setShowQuickMultiple(true)}
              size={isMobile ? "sm" : "default"}
            >
              <Copy className="h-4 w-4 ml-1" />
              יצירה מרובה
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards for mobile */}
      <ScheduleStats shifts={shifts} isMobile={isMobile} />

      {/* Compact Filters for mobile */}
      {showFilters && (
        <div className={isMobile ? 'pb-2' : ''}>
          <ShiftScheduleFilters
            filters={filters}
            onFiltersChange={updateFilters}
            employees={employees}
            branches={branches}
          />
        </div>
      )}

      {/* Main Content with Mobile-Optimized Tabs */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 mb-2 h-8 text-xs' : 'grid-cols-3 mb-4'}`}>
            <TabsTrigger value="schedule" className={isMobile ? 'text-xs px-2' : ''}>לוח משמרות</TabsTrigger>
            <TabsTrigger value="holidays" className={isMobile ? 'text-xs px-2' : ''}>חגים ומועדים</TabsTrigger>
            <TabsTrigger value="google-calendar" className={isMobile ? 'text-xs px-1' : ''}>Google</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <CardHeader className={`${isMobile ? 'pb-1 px-2 pt-2' : 'pb-3'}`}>
                <ScheduleHeader
                  currentDate={currentDate}
                  view={view}
                  setView={setView}
                  navigateDate={navigateDate}
                  isMobile={isMobile}
                />
              </CardHeader>
              
              <CardContent className={`flex-1 flex flex-col min-h-0 overflow-hidden ${isMobile ? 'p-0' : 'p-0'}`}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600 text-sm">טוען נתוני משמרות ולוח שנה...</p>
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
                    pendingSubmissions={pendingSubmissions}
                    businessId={businessId}
                    onShiftClick={handleShiftClick}
                    onShiftUpdate={updateShift}
                    onAddShift={handleAddShift}
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
                    onAddShift={handleAddShift}
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
                    onAddShift={handleAddShift}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="holidays" className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">טוען נתוני חגים ומועדים...</p>
                </div>
              </div>
            ) : (
              <HolidaysAndFestivalsTable 
                holidays={holidays}
                shabbatTimes={shabbatTimes}
                className="h-full overflow-auto"
              />
            )}
          </TabsContent>

          <TabsContent value="google-calendar" className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">טוען אירועי Google Calendar...</p>
                </div>
              </div>
            ) : (
              <GoogleCalendarEventsTable 
                events={googleEvents}
                businessId={businessId}
                className="h-full overflow-auto"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Debug Information - smaller on mobile */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded ${isMobile ? 'text-[10px] max-w-[120px]' : 'text-xs max-w-xs'} opacity-75`}>
          <div>טאב פעיל: {activeTab}</div>
          <div>אירועים: {combinedEvents.length}</div>
          <div>Google: {googleEvents.length}</div>
          <div>חגים: {holidays.length}</div>
          <div>שבת: {shabbatTimes.length}</div>
          <div>טוען: {isLoading ? 'כן' : 'לא'}</div>
        </div>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <UnifiedShiftCreator
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateShift}
          onBulkSubmit={handleBulkCreate}
          employees={employees}
          branches={branches}
          onBranchCreated={handleBranchCreated}
        />
      )}
      
      {showQuickMultiple && (
        <QuickMultipleShiftsDialog
          isOpen={showQuickMultiple}
          onClose={() => {
            setShowQuickMultiple(false);
            setQuickMultipleShift(undefined);
          }}
          onSubmit={handleCreateMultipleShifts}
          employees={employees}
          branches={branches}
          prefilledShift={quickMultipleShift}
          onBranchCreated={handleBranchCreated}
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

      {showTemplatesDialog && (
        <ShiftTemplatesApplyDialog
          isOpen={showTemplatesDialog}
          onClose={() => setShowTemplatesDialog(false)}
          selectedDate={templatesSelectedDate}
          onShiftsCreated={() => {
            // רענון הנתונים לאחר יצירת משמרות
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
