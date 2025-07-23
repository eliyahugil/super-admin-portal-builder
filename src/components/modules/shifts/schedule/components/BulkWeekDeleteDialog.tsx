
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShiftScheduleData } from '../types';
import { WeekRangePicker } from './WeekRangePicker';

interface BulkWeekDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

export const BulkWeekDeleteDialog: React.FC<BulkWeekDeleteDialogProps> = ({
  isOpen,
  onClose,
  businessId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'week' | 'range'>('week');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Week selection
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  
  // Range selection
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Shifts data
  const [shiftsToDelete, setShiftsToDelete] = useState<ShiftScheduleData[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle week selection change
  const handleWeekChange = (start: string, end: string) => {
    console.log('Week changed:', { start, end });
    setWeekStartDate(start);
    setWeekEndDate(end);
  };

  // Fetch shifts based on current selection
  const fetchShifts = async () => {
    if (!businessId) return;
    
    let queryStartDate = '';
    let queryEndDate = '';
    
    if (activeTab === 'week') {
      if (!weekStartDate || !weekEndDate) return;
      queryStartDate = weekStartDate;
      queryEndDate = weekEndDate;
    } else {
      if (!startDate || !endDate) return;
      queryStartDate = format(startDate, 'yyyy-MM-dd');
      queryEndDate = format(endDate, 'yyyy-MM-dd');
    }

    console.log('Fetching shifts for period:', { queryStartDate, queryEndDate, businessId });
    setLoading(true);

    try {
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
          is_assigned,
          is_archived,
          created_at,
          updated_at,
          required_employees,
          priority,
          shift_assignments,
          employee:employees(id, first_name, last_name),
          branch:branches(id, name)
        `)
        .eq('business_id', businessId)
        .eq('is_archived', false)
        .gte('shift_date', queryStartDate)
        .lte('shift_date', queryEndDate)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      console.log('Fetched shifts:', data?.length || 0);
      setShiftsToDelete(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את המשמרות',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch shifts when selection changes
  useEffect(() => {
    if (isOpen) {
      fetchShifts();
    }
  }, [isOpen, activeTab, weekStartDate, weekEndDate, startDate, endDate, businessId]);

  // Handle delete action
  const handleDelete = async () => {
    if (shiftsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const shiftIds = shiftsToDelete.map(shift => shift.id);
      
      const { error } = await supabase
        .from('scheduled_shifts')
        .update({ is_archived: true })
        .in('id', shiftIds);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `${shiftsToDelete.length} משמרות נמחקו בהצלחה`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המשמרות',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setShiftsToDelete([]);
    setWeekStartDate('');
    setWeekEndDate('');
    setStartDate(undefined);
    setEndDate(undefined);
    setActiveTab('week');
    onClose();
  };

  // Get period description
  const getPeriodDescription = () => {
    if (activeTab === 'week' && weekStartDate && weekEndDate) {
      return `${format(new Date(weekStartDate), 'dd/MM/yyyy', { locale: he })} - ${format(new Date(weekEndDate), 'dd/MM/yyyy', { locale: he })}`;
    }
    if (activeTab === 'range' && startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy', { locale: he })} - ${format(endDate, 'dd/MM/yyyy', { locale: he })}`;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            מחיקת משמרות בתקופה נבחרת
          </DialogTitle>
          <DialogDescription>
            בחר תקופה ומחק את כל המשמרות בטווח התאריכים
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'week' | 'range')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">שבוע שלם</TabsTrigger>
            <TabsTrigger value="range">טווח מותאם</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4">
            <WeekRangePicker 
              onWeekChange={handleWeekChange}
              initialDate={new Date()}
            />
          </TabsContent>

          <TabsContent value="range" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">תאריך קיום</label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: he }) : 'בחר תאריך התחלה'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium">תאריך התחלה</label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: he }) : 'בחר תאריך סיום'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Shifts Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">משמרות למחיקה בתקופה הנבחרת:</h4>
            {getPeriodDescription() && (
              <Badge variant="outline">{getPeriodDescription()}</Badge>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">טוען משמרות...</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                נמצאו {shiftsToDelete.length} משמרות למחיקה בתקופה הנבחרת:
              </div>

              {shiftsToDelete.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">לא נמצאו משמרות בתקופה זו</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {shiftsToDelete.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {format(new Date(shift.shift_date), 'dd/MM/yyyy', { locale: he })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {shift.start_time} - {shift.end_time}
                          {shift.employee && ` • ${shift.employee.first_name} ${shift.employee.last_name}`}
                          {shift.branch && ` • ${shift.branch.name}`}
                        </div>
                      </div>
                      <Badge variant={shift.status === 'approved' ? 'default' : 'secondary'}>
                        {shift.status === 'approved' ? 'מאושר' : shift.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Warning */}
        {shiftsToDelete.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>אזהרה!</strong> פעולה זו תמחק את כל המשמרות בתקופה הנבחרת.
              <br />
              לא ניתן לבטל פעולה זו!
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            ביטול
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={shiftsToDelete.length === 0 || isDeleting || loading}
          >
            {isDeleting ? 'מוחק...' : `מחק ${shiftsToDelete.length} משמרות`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
