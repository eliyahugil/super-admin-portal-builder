
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { WeekRangePicker } from './WeekRangePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ShiftScheduleData } from '../types';

interface BulkWeekDeleteDialogProps {
  onSuccess?: () => void;
  businessId?: string | null;
}

// Helper function to map status strings to the correct union type
const mapStatusToUnion = (status: string): 'pending' | 'approved' | 'rejected' | 'completed' => {
  switch (status) {
    case 'pending':
    case 'approved':
    case 'rejected':
    case 'completed':
      return status as 'pending' | 'approved' | 'rejected' | 'completed';
    default:
      return 'pending';
  }
};

// Helper function to safely parse shift assignments from JSON
const parseShiftAssignments = (assignments: any): ShiftScheduleData['shift_assignments'] => {
  if (!assignments || !Array.isArray(assignments)) {
    return [];
  }
  
  return assignments.map((assignment: any) => ({
    id: assignment?.id || '',
    type: (assignment?.type === 'תגבור' ? 'תגבור' : 'חובה') as 'חובה' | 'תגבור',
    employee_id: assignment?.employee_id || null,
    position: assignment?.position || 1,
    is_required: Boolean(assignment?.is_required)
  }));
};

const BulkWeekDeleteContent: React.FC<{
  weekStart: string;
  weekEnd: string;
  setWeekStart: (date: string) => void;
  setWeekEnd: (date: string) => void;
  weekShifts: ShiftScheduleData[];
  loadingShifts: boolean;
  handleDelete: () => void;
  deleteShiftsMutation: any;
  onClose: () => void;
}> = ({
  weekStart,
  weekEnd,
  setWeekStart,
  setWeekEnd,
  weekShifts,
  loadingShifts,
  handleDelete,
  deleteShiftsMutation,
  onClose
}) => {
  const handleWeekChange = (startDate: string, endDate: string) => {
    console.log('📅 Week changed:', { startDate, endDate });
    setWeekStart(startDate);
    setWeekEnd(endDate);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0" dir="rtl">
      {/* Week Range Picker */}
      <div>
        <h4 className="font-medium mb-3 text-base sm:text-sm">בחירת שבוע:</h4>
        <WeekRangePicker 
          onWeekChange={handleWeekChange}
          initialDate={new Date()}
        />
      </div>

      {/* Shifts Preview */}
      {weekStart && weekEnd && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-base sm:text-sm">משמרות שיימחקו:</h4>
            <div className="flex items-center gap-2">
              {loadingShifts ? (
                <span className="text-sm text-gray-500">טוען...</span>
              ) : (
                <span className="font-medium text-red-600 text-sm">
                  {weekShifts.length} משמרות
                </span>
              )}
            </div>
          </div>

          {loadingShifts ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              טוען משמרות...
            </div>
          ) : weekShifts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg text-sm">
              לא נמצאו משמרות בשבוע הנבחר
            </div>
          ) : (
            <div className="max-h-40 sm:max-h-60 overflow-y-auto border rounded-lg">
              <div className="space-y-1">
                {weekShifts.map((shift) => (
                  <div key={shift.id} className="p-3 border-b last:border-b-0 bg-red-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm">
                          {formatDate(shift.shift_date)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {shift.start_time} - {shift.end_time}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {shift.branch_name || 'ללא סניף'} • {shift.role || 'ללא תפקיד'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {weekShifts.length > 0 && (
        <div className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-yellow-800 mb-1">אזהרה!</p>
            <p className="text-yellow-700">
              פעולה זו תמחק את כל המשמרות בשבוע הנבחר ולא ניתן לבטל אותה.
              וודא שאתה בטוח לפני המשך.
            </p>
          </div>
        </div>
      )}

      {/* Actions - Mobile */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          בטל
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={weekShifts.length === 0 || deleteShiftsMutation.isPending || loadingShifts}
          className="w-full sm:w-auto"
        >
          {deleteShiftsMutation.isPending ? 'מוחק...' : `מחק ${weekShifts.length} משמרות`}
        </Button>
      </div>
    </div>
  );
};

export const BulkWeekDeleteDialog: React.FC<BulkWeekDeleteDialogProps> = ({
  onSuccess,
  businessId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<string>('');
  const [weekEnd, setWeekEnd] = useState<string>('');
  const isMobile = useIsMobile();
  
  const queryClient = useQueryClient();

  // Fetch shifts for the selected week
  const { data: weekShifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['week-shifts', businessId, weekStart, weekEnd],
    queryFn: async (): Promise<ShiftScheduleData[]> => {
      if (!businessId || !weekStart || !weekEnd) return [];
      
      console.log('🔍 Fetching shifts for week:', { businessId, weekStart, weekEnd });
      
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          id,
          business_id,
          shift_date,
          start_time,
          end_time,
          employee_id,
          branch_id,
          role,
          notes,
          status,
          shift_template_id,
          is_assigned,
          is_archived,
          required_employees,
          priority,
          shift_assignments,
          created_at,
          updated_at,
          is_new,
          manager_override,
          override_by,
          override_at,
          branches!inner(name),
          employees(first_name, last_name)
        `)
        .eq('business_id', businessId)
        .gte('shift_date', weekStart)
        .lte('shift_date', weekEnd)
        .order('shift_date', { ascending: true });

      if (error) {
        console.error('Error fetching week shifts:', error);
        throw error;
      }

      const formattedShifts: ShiftScheduleData[] = (data || []).map(shift => ({
        id: shift.id,
        business_id: shift.business_id,
        shift_date: shift.shift_date,
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        employee_id: shift.employee_id,
        branch_id: shift.branch_id,
        role: shift.role,
        notes: shift.notes,
        status: mapStatusToUnion(shift.status),
        shift_template_id: shift.shift_template_id,
        is_assigned: shift.is_assigned || false,
        is_archived: shift.is_archived || false,
        required_employees: shift.required_employees,
        priority: shift.priority as 'critical' | 'normal' | 'backup' | undefined,
        shift_assignments: parseShiftAssignments(shift.shift_assignments),
        created_at: shift.created_at,
        updated_at: shift.updated_at,
        branch_name: shift.branches?.name || 'ללא סניף',
        role_preference: shift.role,
        is_new: shift.is_new
      }));

      console.log('✅ Found shifts for week:', formattedShifts.length);
      return formattedShifts;
    },
    enabled: !!businessId && !!weekStart && !!weekEnd && isOpen,
  });

  const handleDelete = () => {
    if (weekShifts.length === 0) {
      toast.error('לא נמצאו משמרות למחיקה');
      return;
    }

    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למחוק ${weekShifts.length} משמרות מהשבוע הנבחר?`
    );

    if (confirmed) {
      const shiftIds = weekShifts.map(shift => shift.id);
      deleteShiftsMutation.mutate(shiftIds);
    }
  };

  // Delete shifts mutation
  const deleteShiftsMutation = useMutation({
    mutationFn: async (shiftIds: string[]) => {
      console.log('🗑️ Deleting shifts:', shiftIds);
      
      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .in('id', shiftIds);

      if (error) {
        console.error('Error deleting shifts:', error);
        throw error;
      }

      return { success: true, deletedCount: shiftIds.length };
    },
    onSuccess: (result) => {
      console.log('✅ Successfully deleted shifts:', result);
      toast.success(`נמחקו בהצלחה ${result.deletedCount} משמרות`);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['shifts-schedule'] });
      
      // Close dialog and reset state
      setIsOpen(false);
      setWeekStart('');
      setWeekEnd('');
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error) => {
      console.error('❌ Error deleting shifts:', error);
      toast.error('שגיאה במחיקת המשמרות');
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setWeekStart('');
    setWeekEnd('');
  };

  const TriggerButton = (
    <Button variant="outline" size="sm">
      <Trash2 className="h-4 w-4" />
      מחק שבוע
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-right">
            <DrawerTitle className="flex items-center gap-2 justify-end">
              <span>מחיקת משמרות לפי שבוע</span>
              <Trash2 className="h-5 w-5 text-red-500" />
            </DrawerTitle>
            <DrawerDescription className="text-right">
              בחר שבוע כדי למחוק את כל המשמרות שלו
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <BulkWeekDeleteContent
              weekStart={weekStart}
              weekEnd={weekEnd}
              setWeekStart={setWeekStart}
              setWeekEnd={setWeekEnd}
              weekShifts={weekShifts}
              loadingShifts={loadingShifts}
              handleDelete={handleDelete}
              deleteShiftsMutation={deleteShiftsMutation}
              onClose={handleClose}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            מחיקת משמרות לפי שבוע
          </DialogTitle>
          <DialogDescription>
            בחר שבוע כדי למחוק את כל המשמרות שלו
          </DialogDescription>
        </DialogHeader>

        <BulkWeekDeleteContent
          weekStart={weekStart}
          weekEnd={weekEnd}
          setWeekStart={setWeekStart}
          setWeekEnd={setWeekEnd}
          weekShifts={weekShifts}
          loadingShifts={loadingShifts}
          handleDelete={handleDelete}
          deleteShiftsMutation={deleteShiftsMutation}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
