import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, FileText, CheckSquare } from 'lucide-react';
import { WeeklyScheduleView } from './schedule/WeeklyScheduleView';
import { MonthlyScheduleView } from './schedule/MonthlyScheduleView';
import { YearlyScheduleView } from './schedule/YearlyScheduleView';
import { ShiftScheduleFilters } from './schedule/ShiftScheduleFilters';
import { UnifiedShiftCreator } from './schedule/UnifiedShiftCreator';
import { ShiftDetailsDialog } from './schedule/ShiftDetailsDialog';
import { QuickMultipleShiftsDialog } from './schedule/QuickMultipleShiftsDialog';
import { ShiftAssignmentDialog } from './schedule/ShiftAssignmentDialog';
import { PendingSubmissionsDialog } from './schedule/PendingSubmissionsDialog';
import { ShiftTemplatesApplyDialog } from './schedule/components/ShiftTemplatesApplyDialog';
import { BulkEditShiftsDialog } from './schedule/BulkEditShiftsDialog';
import { ScheduleErrorBoundary } from './schedule/ScheduleErrorBoundary';
import { ManagerOverrideDialog } from './schedule/components/ManagerOverrideDialog';
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
import { AutoScheduleAssistant } from './AutoScheduleAssistant';
import { AdvancedSchedulingDashboard } from './advanced-scheduling/AdvancedSchedulingDashboard';
import { NotificationsPanel } from './notifications/NotificationsPanel';
import { useNotifications } from './notifications/useNotifications';
import { ParallelScheduleView } from './schedule/ParallelScheduleView';
import { GroupedByBranchView } from './schedule/components/GroupedByBranchView';
import type { ScheduleView, ShiftScheduleData, CreateShiftData } from './schedule/types';

export const ResponsiveShiftSchedule: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<ScheduleView>('month');
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
  
  // Bulk edit states
  const [selectedShifts, setSelectedShifts] = useState<ShiftScheduleData[]>([]);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Pending submissions dialog state
  const [showPendingSubmissionsDialog, setShowPendingSubmissionsDialog] = useState(false);
  
  // Manager override dialog state
  const [showManagerOverrideDialog, setShowManagerOverrideDialog] = useState(false);
  const [managerOverrideData, setManagerOverrideData] = useState<{
    shiftId: string;
    updates: Partial<ShiftScheduleData>;
    conflictDetails: any;
    employeeName: string;
  } | null>(null);

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

  const queryClient = useQueryClient();

  // Calendar integration מושבת, אבל משאיר את הפונקציונליות הבסיסית
  const {
    combinedEvents = [],
    googleEvents = [],
    holidays: calendarHolidays = [],
    shabbatTimes: calendarShabbatTimes = [],
    loading: calendarLoading = false,
    getEventsForDate = () => []
  } = (() => {
    // מחזיר ערכי ברירת מחדל ללא אינטגרציה עם Google Maps
    return {
      combinedEvents: [],
      googleEvents: [],
      holidays: [],
      shabbatTimes: [],
      loading: false,
      getEventsForDate: () => []
    };
  })();

  // Notifications system
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addShiftSubmissionNotification
  } = useNotifications();

  const isLoading = loading || calendarLoading;

  console.log('📊 ResponsiveShiftSchedule - Current state:', {
    businessId,
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    branchesCount: branches.length,
    combinedEventsCount: combinedEvents.length,
    googleEventsCount: googleEvents.length,
    holidaysCount: calendarHolidays.length,
    shabbatTimesCount: calendarShabbatTimes.length,
    loading: loading || calendarLoading,
    error: error?.message || null,
    activeTab,
    isSelectionMode,
    selectedShiftsCount: selectedShifts.length,
    view,
    isLoading,
    currentDate: currentDate.toISOString(),
    hasCurrentDate: !!currentDate,
    filtersActive: JSON.stringify(filters)
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
    console.log('📝 Shifts data:', shifts);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const shift of shifts) {
      try {
        console.log('📝 Creating shift:', shift);
        await createShift(shift);
        successCount++;
        console.log('✅ Successfully created shift');
      } catch (error) {
        errorCount++;
        console.error('❌ Failed to create shift:', error, shift);
      }
    }
    
    console.log(`📊 Creation summary: ${successCount} successful, ${errorCount} failed`);
    
    // רענן את הנתונים בכוח
    console.log('🔄 Forcing data refresh...');
    queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
    queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
    await queryClient.refetchQueries({ queryKey: ['schedule-shifts', businessId] });
    console.log('✅ Data refresh completed');
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
    try {
      await updateShift(shiftId, { employee_id: employeeId });
      setAssignmentShift(null);
    } catch (error: any) {
      console.error('Error assigning employee:', error);
      
      // אם זה קונפליקט שדורש אישור מנהל
      if (error.code === 'MANAGER_OVERRIDE_REQUIRED') {
        setManagerOverrideData({
          shiftId,
          updates: { employee_id: employeeId },
          conflictDetails: error.conflictData,
          employeeName: employees.find(emp => emp.id === employeeId)?.first_name + ' ' + 
                       employees.find(emp => emp.id === employeeId)?.last_name
        });
        setShowManagerOverrideDialog(true);
      } else {
        // שגיאה אחרת - הצג הודעה רגילה
        throw error;
      }
    }
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

  const handleShiftSelection = (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => {
    console.log('🔄 handleShiftSelection called:', { 
      shiftId: shift.id, 
      selected, 
      currentSelection: selectedShifts.length,
      isSelectionModeActive: isSelectionMode 
    });
    if (selected) {
      setSelectedShifts(prev => [...prev, shift]);
    } else {
      setSelectedShifts(prev => prev.filter(s => s.id !== shift.id));
    }
  };

  const handleSelectAllShifts = () => {
    setSelectedShifts(shifts);
  };

  const handleClearSelection = () => {
    setSelectedShifts([]);
    setIsSelectionMode(false);
    console.log('🔄 Selection cleared, isSelectionMode:', false, 'selectedShifts:', []);
  };

  const handleBulkUpdate = async (updates: Partial<ShiftScheduleData>) => {
    console.log('🔄 Starting bulk update with data:', updates);
    console.log('🔄 Updating shifts:', selectedShifts.map(s => s.id));
    
    for (const shift of selectedShifts) {
      console.log(`🔄 Updating shift ${shift.id} with:`, updates);
      await updateShift(shift.id, updates);
    }
    handleClearSelection();
  };

  const handleBulkDelete = async () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedShifts.length} משמרות?`)) {
      for (const shift of selectedShifts) {
        await deleteShift(shift.id);
      }
      handleClearSelection();
    }
  };

  const handleManagerOverride = async (code: string) => {
    if (!managerOverrideData) return;
    
    try {
      await updateShift(
        managerOverrideData.shiftId, 
        managerOverrideData.updates, 
        code
      );
      setAssignmentShift(null);
      setManagerOverrideData(null);
    } catch (error) {
      console.error('Manager override failed:', error);
      throw error;
    }
  };

  // Helper function removed - submissions system no longer exists

  return (
    <div className={`w-full ${isMobile ? 'p-2' : 'p-6'} space-y-2 lg:space-y-6 h-full flex flex-col bg-white`} dir="rtl">
      {/* Mobile optimized header */}
      <div className="flex flex-col space-y-2 bg-white">
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} bg-white`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl lg:text-3xl'} font-bold text-gray-900`}>לוח משמרות</h1>
            {!isMobile && <p className="text-sm lg:text-base text-gray-600 mt-1">ניהול וצפייה בלוח הזמנים עם אינטגרציית Google Calendar, חגים וזמני שבת</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications Panel */}
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDeleteNotification={deleteNotification}
            />
            
            <ScheduleActions
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              setShowCreateDialog={setShowCreateDialog}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              isMobile={isMobile}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
              selectedShifts={selectedShifts}
              onBulkEdit={() => setShowBulkEditDialog(true)}
              onBulkDelete={handleBulkDelete}
              onSelectAll={handleSelectAllShifts}
              onClearSelection={handleClearSelection}
            />
          </div>
          
          {/* Templates and Quick Multiple Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                console.log('🔄 Manual refresh button clicked');
                try {
                  await refetchShifts();
                  console.log('✅ Refetch completed');
                } catch (error) {
                  console.error('Error during refresh:', error);
                }
              }}
              variant="outline"
              size={isMobile ? "sm" : "default"}
            >
              🔄 רענן
            </Button>
            <Button
              onClick={() => handleApplyTemplates()}
              variant="outline"
              size={isMobile ? "sm" : "default"}
            >
              <FileText className="h-4 w-4 ml-1" />
              תבניות משמרות
            </Button>
            
            {/* Auto Schedule Assistant */}
            <AutoScheduleAssistant
              weekStartDate={currentDate.toISOString().split('T')[0]}
              emptyShifts={shifts.filter(shift => !shift.employee_id)}
              onShiftUpdate={updateShift}
            />
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

      {/* Selection Mode Banner */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">מצב בחירה פעיל</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedShifts.length} משמרות נבחרו
              </Badge>
            </div>
            <Button 
              onClick={handleClearSelection}
              variant="ghost"
              size="sm"
              className="text-blue-700 hover:text-blue-800"
            >
              יציאה ממצב בחירה
            </Button>
          </div>
          {selectedShifts.length === 0 && (
            <p className="text-sm text-blue-600 mt-2">
              לחץ על המשמרות כדי לבחור אותן לעריכה גורפת
            </p>
          )}
        </div>
      )}

      {/* Compact Stats Cards for mobile */}
      <ScheduleStats shifts={shifts} isMobile={isMobile} />

      {/* Quick Branch Filter - Always visible for easy access */}
      <div className="bg-white border rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">תצוגת סניפים:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => updateFilters({ ...filters, branch: 'all' })}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filters.branch === 'all' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              כל הסניפים יחד ({shifts.length})
            </button>
            <button
              onClick={() => setView(view === 'grouped' ? 'week' : 'grouped')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                view === 'grouped' 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              תצוגה מקובצת לפי סניפים
            </button>
            {branches.map(branch => {
              const branchShiftsCount = shifts.filter(s => s.branch_id === branch.id).length;
              return (
                <button
                  key={branch.id}
                  onClick={() => updateFilters({ ...filters, branch: branch.id })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.branch === branch.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {branch.name} ({branchShiftsCount})
                </button>
              );
            })}
          </div>
        </div>
      </div>

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

      {/* Main Content with Mobile-Optimized Tabs - Fixed at top */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col bg-white">
          <div className="sticky top-0 z-10 bg-white border-b">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 h-10 text-sm' : 'grid-cols-3 h-12'} bg-gray-50 rounded-none border-0`}>
              <TabsTrigger 
                value="schedule" 
                className={`${isMobile ? 'text-sm px-2' : 'text-base px-4'} data-[state=active]:bg-white data-[state=active]:shadow-sm`}
              >
                📅 לוח משמרות
              </TabsTrigger>
              <TabsTrigger 
                value="parallel" 
                className={`${isMobile ? 'text-sm px-2' : 'text-base px-4'} data-[state=active]:bg-white data-[state=active]:shadow-sm`}
              >
                🔗 תצוגה מקבילה
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className={`${isMobile ? 'text-sm px-2' : 'text-base px-4'} data-[state=active]:bg-white data-[state=active]:shadow-sm`}
              >
                ⚙️ סידור מתקדם
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="schedule" className="flex-1 flex flex-col min-h-0 bg-white">
            <Card className="flex-1 flex flex-col min-h-0 bg-white border shadow-sm">
              <CardHeader className={`${isMobile ? 'pb-1 px-2 pt-2' : 'pb-3'} bg-white`}>
                <ScheduleHeader
                  currentDate={currentDate}
                  view={view}
                  setView={setView}
                  navigateDate={navigateDate}
                  isMobile={isMobile}
                />
              </CardHeader>
              
              <CardContent className={`flex-1 flex flex-col min-h-0 ${isMobile ? 'p-0' : 'p-0'}`}>
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
                       branches={branches}
                       currentDate={currentDate}
                       holidays={calendarHolidays}
                       shabbatTimes={calendarShabbatTimes}
                       calendarEvents={combinedEvents}
                       pendingSubmissions={pendingSubmissions}
                       businessId={businessId}
                       onShiftClick={handleShiftClick}
                       onShiftUpdate={updateShift}
                       onAddShift={handleAddShift}
                       onShiftDelete={deleteShift}
                       isSelectionMode={isSelectionMode}
                       selectedShifts={selectedShifts}
                       onShiftSelection={handleShiftSelection}
                       onShowPendingSubmissions={() => setShowPendingSubmissionsDialog(true)}
                    />
                   ) : view === 'grouped' ? (
                     <GroupedByBranchView
                       shifts={shifts}
                       employees={employees}
                       branches={branches}
                       currentDate={currentDate}
                       onShiftClick={handleShiftClick}
                       onShiftUpdate={updateShift}
                       onAddShift={handleAddShift}
                       onShiftDelete={deleteShift}
                       isSelectionMode={isSelectionMode}
                       selectedShifts={selectedShifts}
                       onShiftSelection={handleShiftSelection}
                       pendingSubmissions={pendingSubmissions}
                     />
                   ) : view === 'month' ? (
                   <MonthlyScheduleView
                     shifts={shifts}
                     employees={employees}
                     branches={branches}
                      currentDate={currentDate}
                      holidays={calendarHolidays}
                      shabbatTimes={calendarShabbatTimes}
                     calendarEvents={combinedEvents}
                     onShiftClick={handleShiftClick}
                     onShiftUpdate={updateShift}
                     onAddShift={handleAddShift}
                     onShiftDelete={deleteShift}
                     isSelectionMode={isSelectionMode}
                     selectedShifts={selectedShifts}
                     onShiftSelection={handleShiftSelection}
                   />
                 ) : (
                   <YearlyScheduleView
                     shifts={shifts}
                     employees={employees}
                     branches={branches}
                      currentDate={currentDate}
                      holidays={calendarHolidays}
                      shabbatTimes={calendarShabbatTimes}
                     calendarEvents={combinedEvents}
                     onShiftClick={handleShiftClick}
                     onShiftUpdate={updateShift}
                     onAddShift={handleAddShift}
                     onShiftDelete={deleteShift}
                     isSelectionMode={isSelectionMode}
                     selectedShifts={selectedShifts}
                     onShiftSelection={handleShiftSelection}
                   />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="parallel" className="flex-1 flex flex-col min-h-0">
            <ParallelScheduleView
              shifts={shifts}
              employees={employees}
              branches={branches}
              currentDate={currentDate}
              holidays={calendarHolidays}
              shabbatTimes={calendarShabbatTimes}
              calendarEvents={combinedEvents}
              pendingSubmissions={pendingSubmissions}
              businessId={businessId}
              onShiftClick={handleShiftClick}
              onShiftUpdate={updateShift}
              onAddShift={handleAddShift}
              onShiftDelete={deleteShift}
              isSelectionMode={isSelectionMode}
              selectedShifts={selectedShifts}
              onShiftSelection={handleShiftSelection}
              onShowPendingSubmissions={() => setShowPendingSubmissionsDialog(true)}
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="flex-1 w-full">
            <AdvancedSchedulingDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Debug Information - smaller on mobile */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded ${isMobile ? 'text-[10px] max-w-[120px]' : 'text-xs max-w-xs'} opacity-75`}>
          <div>טאב פעיל: {activeTab}</div>
          <div>אירועים: {combinedEvents.length}</div>
          <div>Google: {googleEvents.length}</div>
          <div>חגים: {calendarHolidays.length}</div>
          <div>שבת: {calendarShabbatTimes.length}</div>
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
          onRefresh={async () => { await refetchShifts(); }}
        />
      )}

      {assignmentShift && (
        <ShiftAssignmentDialog
          isOpen={!!assignmentShift}
          onClose={() => setAssignmentShift(null)}
          shift={assignmentShift}
          employees={employees}
          allShifts={shifts}
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

      {showBulkEditDialog && selectedShifts.length > 0 && (
        <BulkEditShiftsDialog
          isOpen={showBulkEditDialog}
          onClose={() => setShowBulkEditDialog(false)}
          selectedShifts={selectedShifts}
          employees={employees}
          branches={branches}
          onUpdate={handleBulkUpdate}
        />
      )}

      {/* Manager Override Dialog */}
      {showManagerOverrideDialog && managerOverrideData && (
        <ManagerOverrideDialog
          isOpen={showManagerOverrideDialog}
          onClose={() => {
            setShowManagerOverrideDialog(false);
            setManagerOverrideData(null);
          }}
          onConfirm={handleManagerOverride}
          conflictDetails={{
            employeeName: managerOverrideData.employeeName,
            currentShiftTime: managerOverrideData.conflictDetails?.currentShift?.start_time + '-' + 
                             managerOverrideData.conflictDetails?.currentShift?.end_time,
            conflictingShifts: managerOverrideData.conflictDetails?.conflictingShifts,
            date: managerOverrideData.conflictDetails?.currentShift?.shift_date,
            branchName: branches.find(b => b.id === managerOverrideData.conflictDetails?.currentShift?.branch_id)?.name
          }}
        />
      )}

      {/* Pending submissions dialog removed - submissions system no longer exists */}
    </div>
  );
};
