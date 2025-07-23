
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useShiftsByDateRange } from '../hooks/useShiftsByDateRange';
import { CalendarIcon, Copy, Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

interface CopyPreviousScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Enhanced helper function to safely get string value and handle null/undefined
function safeString(value: any): string {
  console.log('🔍 safeString called with:', { value, type: typeof value, isNull: value === null, isUndefined: value === undefined });
  
  if (value === null || value === undefined) {
    console.log('📝 safeString: returning empty string for null/undefined');
    return '';
  }
  
  // Convert to string safely
  const stringValue = String(value);
  console.log('📝 safeString: converted to string:', stringValue);
  return stringValue;
}

export const CopyPreviousScheduleDialog: React.FC<CopyPreviousScheduleDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [sourceDate, setSourceDate] = useState<Date | undefined>(undefined);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();

  console.log('🔄 CopyPreviousScheduleDialog - Business ID:', businessId);

  // Get source week range
  const sourceWeekStart = sourceDate ? startOfWeek(sourceDate, { weekStartsOn: 0 }) : null;
  const sourceWeekEnd = sourceDate ? endOfWeek(sourceDate, { weekStartsOn: 0 }) : null;

  // Fetch shifts for the selected source week
  const { data: sourceShifts = [], isLoading: isLoadingShifts } = useShiftsByDateRange(
    sourceWeekStart ? format(sourceWeekStart, 'yyyy-MM-dd') : '',
    sourceWeekEnd ? format(sourceWeekEnd, 'yyyy-MM-dd') : ''
  );

  console.log('📊 Source shifts loaded:', {
    count: sourceShifts.length,
    sourceDate: sourceDate?.toISOString(),
    businessId,
    shifts: sourceShifts.map(s => ({
      id: s.id,
      date: s.shift_date,
      branch_id: s.branch_id,
      employee_id: s.employee_id
    }))
  });

  const handleCopySchedule = async () => {
    if (!sourceDate || !targetDate || !businessId) {
      toast({
        title: "שגיאה",
        description: "אנא בחר תאריכים ווודא שיש עסק נבחר",
        variant: "destructive"
      });
      return;
    }

    if (sourceShifts.length === 0) {
      toast({
        title: "אין משמרות להעתקה",
        description: "לא נמצאו משמרות בשבוע הנבחר",
        variant: "destructive"
      });
      return;
    }

    setCopying(true);

    try {
      const targetWeekStart = startOfWeek(targetDate, { weekStartsOn: 0 });
      const sourceWeekStartDate = startOfWeek(sourceDate, { weekStartsOn: 0 });
      
      // Calculate the difference in days between source and target weeks
      const daysDifference = Math.floor((targetWeekStart.getTime() - sourceWeekStartDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log('📅 Copy calculation:', {
        sourceWeekStart: sourceWeekStartDate.toISOString(),
        targetWeekStart: targetWeekStart.toISOString(),
        daysDifference,
        shiftsToProcess: sourceShifts.length
      });

      // Prepare shifts for copying with enhanced safety - CLEAR EMPLOYEE ASSIGNMENTS
      const shiftsToInsert = sourceShifts
        .filter(shift => {
          // Only copy shifts that have valid branch_id
          if (!shift.branch_id) {
            console.warn('🚨 דילוג על משמרת ללא סניף:', `${shift.shift_date} ${shift.start_time}-${shift.end_time}`);
            return false;
          }
          return true;
        })
        .map(shift => {
          const shiftDate = new Date(shift.shift_date);
          const newShiftDate = addDays(shiftDate, daysDifference);
          
          // Enhanced safe handling for all string fields - CLEAR EMPLOYEE ASSIGNMENTS
          const newShift = {
            business_id: businessId,
            shift_date: format(newShiftDate, 'yyyy-MM-dd'),
            start_time: safeString(shift.start_time),
            end_time: safeString(shift.end_time),
            employee_id: null, // ✅ אפס עובד מוקצה
            branch_id: shift.branch_id, // ✅ שמור סניף
            role: safeString(shift.role),
            notes: safeString(shift.notes),
            status: 'pending' as const,
            is_assigned: false, // ✅ אפס הקצאה
            is_archived: false,
            required_employees: shift.required_employees || 1,
            priority: shift.priority || 'normal' as const,
            shift_assignments: [] // ✅ אפס הקצאות
          };

          console.log('🔧 Processing shift for copy (WITHOUT EMPLOYEE):', {
            original: {
              date: shift.shift_date,
              start_time: shift.start_time,
              end_time: shift.end_time,
              role: shift.role,
              employee_id: shift.employee_id,
              branch_id: shift.branch_id
            },
            new: {
              date: newShift.shift_date,
              start_time: newShift.start_time,
              end_time: newShift.end_time,
              role: newShift.role,
              employee_id: newShift.employee_id, // null
              branch_id: newShift.branch_id,
              is_assigned: newShift.is_assigned // false
            }
          });

          return newShift;
        });

      console.log('💾 Shifts prepared for insertion (WITHOUT EMPLOYEES):', {
        count: shiftsToInsert.length,
        firstShift: shiftsToInsert[0],
        businessId,
        allUnassigned: shiftsToInsert.every(s => s.employee_id === null && s.is_assigned === false)
      });

      if (shiftsToInsert.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו משמרות תקינות להעתקה (חסרים סניפים)",
          variant: "destructive"
        });
        return;
      }

      // Insert the new shifts
      const { data: insertedShifts, error: insertError } = await supabase
        .from('scheduled_shifts')
        .insert(shiftsToInsert)
        .select();

      if (insertError) {
        console.error('❌ Error inserting shifts:', insertError);
        throw insertError;
      }

      console.log('✅ Shifts copied successfully WITHOUT EMPLOYEES:', {
        inserted: insertedShifts?.length || 0,
        targetWeek: format(targetWeekStart, 'yyyy-MM-dd'),
        allUnassigned: insertedShifts?.every(s => s.employee_id === null && s.is_assigned === false)
      });

      toast({
        title: "הצלחה!",
        description: `הועתקו ${insertedShifts?.length || 0} משמרות לשבוע ${format(targetWeekStart, 'dd/MM/yyyy', { locale: he })} ללא עובדים מוקצים`,
      });

      // Reset form and close dialog
      setSourceDate(undefined);
      setTargetDate(undefined);
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('💥 Error copying schedule:', error);
      toast({
        title: "שגיאה בהעתקת לוח הזמנים",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const canCopy = sourceDate && targetDate && sourceShifts.length > 0 && !copying && !isLoadingShifts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            העתקת לוח זמנים קודם
          </DialogTitle>
          <DialogDescription>
            בחר שבוע מקור לעקתקה ושבוע יעד להדבקה (רק שעות וסניפים, ללא עובדים מוקצים)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Week Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              בחר שבוע מקור (להעתקה)
            </h3>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={sourceDate}
                onSelect={setSourceDate}
                locale={he}
                className="mx-auto"
              />
              {sourceDate && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-blue-800">
                    שבוע נבחר: {format(startOfWeek(sourceDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })} - {format(endOfWeek(sourceDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })}
                  </p>
                  {isLoadingShifts ? (
                    <p className="text-sm text-blue-600 mt-1">טוען משמרות...</p>
                  ) : (
                    <p className="text-sm text-blue-600 mt-1">
                      נמצאו {sourceShifts.length} משמרות בשבוע זה
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Target Week Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              בחר שבוע יעד (להדבקה)
            </h3>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                locale={he}
                className="mx-auto"
              />
              {targetDate && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-green-800">
                    שבוע יעד: {format(startOfWeek(targetDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })} - {format(endOfWeek(targetDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {sourceDate && targetDate && sourceShifts.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">סיכום ההעתקה:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• {sourceShifts.length} משמרות יועתקו</li>
                <li>• מתאריך: {format(startOfWeek(sourceDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })}</li>
                <li>• לתאריך: {format(startOfWeek(targetDate, { weekStartsOn: 0 }), 'dd/MM/yyyy', { locale: he })}</li>
                <li className="font-semibold text-orange-700">• ⚠️ עובדים מוקצים יאופסו - רק שעות וסניפים יועתקו</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={copying}
          >
            ביטול
          </Button>
          <Button
            onClick={handleCopySchedule}
            disabled={!canCopy}
            className="flex items-center gap-2"
          >
            {copying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                מעתיק...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                העתק לוח זמנים (ללא עובדים)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
