import React, { useState, useCallback, useMemo } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight, Copy, Filter, Loader2, Plus } from 'lucide-react';
import { addDays, endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useShiftSchedule } from './schedule/useShiftSchedule';
import { ShiftScheduleView } from './schedule/ShiftScheduleView';
import { CreateShiftDialog } from './schedule/components/CreateShiftDialog';
import { UpdateShiftDialog } from './schedule/components/UpdateShiftDialog';
import { DeleteShiftDialog } from './schedule/components/DeleteShiftDialog';
import { CopyPreviousScheduleDialog } from './schedule/components/CopyPreviousScheduleDialog';
import { PendingSubmissionsDialog } from './schedule/components/PendingSubmissionsDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useHolidays } from '@/hooks/useHolidays';
import { useShabbatTimes } from '@/hooks/useShabbatTimes';
import { ScheduleFilters } from './schedule/components/ScheduleFilters';
import { ShiftTable } from './table/ShiftTable';

const ResponsiveShiftSchedule: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
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

  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [isTableView, setIsTableView] = useState(false);

  // Bulk actions
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<any[]>([]);

  // Calendar events
  const { data: calendarEvents = [], isLoading: calendarLoading, error: calendarError } = useCalendarEvents(businessId);
  const { data: holidays = [], isLoading: holidaysLoading, error: holidaysError } = useHolidays(currentDate);
  const { data: shabbatTimes = [], isLoading: shabbatLoading, error: shabbatError } = useShabbatTimes(currentDate);

  // Date range for calendar
  const [date, setDate] = useState<Date | undefined>(currentDate);

  // Debounced search
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);

  // Handlers
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      navigateDate(date);
    }
  };

  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift);
    setShowUpdateDialog(true);
  };

  const handleShiftUpdate = async (shiftId: string, updates: any) => {
    try {
      await updateShift(shiftId, updates);
      setShowUpdateDialog(false);
      toast({
        title: "הצלחה",
        description: "המשמרת עודכנה בהצלחה",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון המשמרת",
        variant: "destructive",
      });
    }
  };

  const handleAddShift = (date: Date) => {
    setDate(date);
    navigateDate(date);
    setShowCreateDialog(true);
  };

  const handleShiftDelete = async (shiftId: string) => {
    try {
      await deleteShift(shiftId);
      setShowDeleteDialog(false);
      toast({
        title: "הצלחה",
        description: "המשמרת נמחקה בהצלחה",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה במחיקת המשמרת",
        variant: "destructive",
      });
    }
  };

  const handleShiftSelection = (shift: any, selected: boolean, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    setSelectedShifts(prev => {
      if (selected) {
        return [...prev, shift];
      } else {
        return prev.filter(s => s.id !== shift.id);
      }
    });
  };

  const handleShowPendingSubmissions = () => {
    setShowPendingDialog(true);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7); // Subtract 7 days for previous week
    } else {
      newDate.setDate(currentDate.getDate() + 7); // Add 7 days for next week
    }
    navigateDate(newDate);
    setDate(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    navigateDate(today);
    setDate(today);
  };

  const disabledDays = useMemo(() => {
    if (!calendarEvents) return [];

    return calendarEvents.map(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
      return eventDate;
    });
  }, [calendarEvents]);

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      {/* Header with Date Navigation and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
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
              onClick={() => setIsTableView(!isTableView)}
            >
              {isTableView ? 'תצוגת לוח' : 'תצוגת טבלה'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCopyDialog(true)}
            >
              <Copy className="h-4 w-4" />
              העתק משמרות משבוע שעבר
            </Button>
            <Button
              size="sm"
              onClick={() => handleAddShift(currentDate)}
            >
              <Plus className="h-4 w-4" />
              הוסף משמרת
            </Button>
          </div>
        </div>

        {/* Date Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleDateNavigation('prev')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleDateNavigation('next')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTodayClick}>
              היום
            </Button>
          </div>

          {/* Date Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={""}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(currentDate, "MMMM yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <DayPicker
                mode="single"
                captionLayout="dropdown"
                showOutsideDays
                selected={date}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={require('date-fns/locale/he')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters and Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScheduleFilters
          filters={filters}
          branches={branches}
          employees={employees}
          onFiltersChange={updateFilters}
        />

        <div className="flex items-center gap-2">
          <Label htmlFor="search">חיפוש:</Label>
          <Input
            type="search"
            id="search"
            placeholder="חפש משמרות..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Badge variant="secondary">
            סה"כ משמרות: {shifts?.length || 0}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSelectionMode(!isSelectionMode)}
          >
            {isSelectionMode ? 'בטל בחירה' : 'בחר משמרות'}
          </Button>
        </div>
      </div>

      {/* Shift Display */}
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">טוען משמרות...</span>
        </div>
      ) : error ? (
        <div className="text-red-500">אירעה שגיאה בטעינת הנתונים.</div>
      ) : (
        <>
          {isTableView ? (
            <ShiftTable shifts={shifts} businessId={businessId} />
          ) : (
            <ShiftScheduleView
              shifts={shifts}
              employees={employees}
              branches={branches}
              currentDate={currentDate}
              holidays={holidays}
              shabbatTimes={shabbatTimes}
              calendarEvents={calendarEvents}
              pendingSubmissions={pendingSubmissions}
              businessId={businessId}
              onShiftClick={handleShiftClick}
              onShiftUpdate={handleShiftUpdate}
              onAddShift={handleAddShift}
              onShiftDelete={handleShiftDelete}
              isSelectionMode={isSelectionMode}
              selectedShifts={selectedShifts}
              onShiftSelection={handleShiftSelection}
              onShowPendingSubmissions={handleShowPendingSubmissions}
            />
          )}
        </>
      )}

      {/* Create Shift Dialog */}
      <CreateShiftDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={createShift}
        businessId={businessId}
        branches={branches}
        employees={employees}
        defaultDate={currentDate}
      />

      {/* Update Shift Dialog */}
      <UpdateShiftDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        shift={selectedShift}
        onUpdate={handleShiftUpdate}
        onDelete={() => {
          setShowUpdateDialog(false);
          setShowDeleteDialog(true);
        }}
        businessId={businessId}
        branches={branches}
        employees={employees}
      />

      {/* Delete Shift Dialog */}
      <DeleteShiftDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        shiftId={selectedShift?.id}
        onDelete={handleShiftDelete}
      />

      {/* Copy Schedule Dialog */}
      <CopyPreviousScheduleDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        onSuccess={() => {
          console.log('✅ Schedule copied successfully, refetching shifts');
          refetchShifts();
        }}
      />

      {/* Pending Submissions Dialog */}
      <PendingSubmissionsDialog
        open={showPendingDialog}
        onOpenChange={setShowPendingDialog}
        pendingSubmissions={pendingSubmissions}
      />
    </div>
  );
};

export default ResponsiveShiftSchedule;
