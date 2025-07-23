
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { getWeekDatesForDate, getUpcomingWeekDates } from '@/lib/dateUtils';

interface BulkWeekDeleteDialogProps {
  onSuccess?: () => void;
}

export const BulkWeekDeleteDialog: React.FC<BulkWeekDeleteDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteMode, setDeleteMode] = useState<'week' | 'range'>('week');
  const [isDeleting, setIsDeleting] = useState(false);
  const [shiftsToDelete, setShiftsToDelete] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();

  // Set default to upcoming week
  React.useEffect(() => {
    if (open) {
      const upcomingWeek = getUpcomingWeekDates();
      const year = upcomingWeek.startDate.getFullYear();
      const weekNumber = getWeekNumber(upcomingWeek.startDate);
      setSelectedWeek(`${year}-W${weekNumber.toString().padStart(2, '0')}`);
    }
  }, [open]);

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getWeekDates = (weekString: string) => {
    const [year, week] = weekString.split('-W');
    const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay());
    else
      ISOweekStart.setDate(simple.getDate() + 7 - simple.getDay());
    
    const weekStart = new Date(ISOweekStart);
    const weekEnd = new Date(ISOweekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
    };
  };

  const handlePreviewShifts = async () => {
    if (!businessId) return;

    let dateRange;
    if (deleteMode === 'week') {
      if (!selectedWeek) return;
      dateRange = getWeekDates(selectedWeek);
    } else {
      if (!startDate || !endDate) return;
      dateRange = { start: startDate, end: endDate };
    }

    try {
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          id,
          shift_date,
          start_time,
          end_time,
          employee:employees(first_name, last_name),
          branch:branches(name)
        `)
        .eq('business_id', businessId)
        .gte('shift_date', dateRange.start)
        .lte('shift_date', dateRange.end)
        .order('shift_date')
        .order('start_time');

      if (error) throw error;

      setShiftsToDelete(data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את המשמרות לתקופה הנבחרת',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteShifts = async () => {
    if (!businessId || shiftsToDelete.length === 0) return;

    setIsDeleting(true);

    try {
      const shiftIds = shiftsToDelete.map(shift => shift.id);
      
      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .in('id', shiftIds);

      if (error) throw error;

      const periodText = deleteMode === 'week' 
        ? `לשבוע שנבחר`
        : `מ-${new Date(startDate).toLocaleDateString('he-IL')} עד ${new Date(endDate).toLocaleDateString('he-IL')}`;

      toast({
        title: 'הצלחה',
        description: `נמחקו ${shiftsToDelete.length} משמרות ${periodText}`,
      });

      handleClose();
      onSuccess?.();

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

  const handleClose = () => {
    setOpen(false);
    setSelectedWeek('');
    setStartDate('');
    setEndDate('');
    setShiftsToDelete([]);
    setShowPreview(false);
  };

  const formatWeekRange = (weekString: string) => {
    if (!weekString) return '';
    const dates = getWeekDates(weekString);
    const start = new Date(dates.start).toLocaleDateString('he-IL');
    const end = new Date(dates.end).toLocaleDateString('he-IL');
    return `${start} - ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          מחק משמרות בתקופה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            מחיקת משמרות בתקופה נבחרת
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>אזהרה!</strong> פעולה זו תמחק את כל המשמרות בתקופה הנבחרת.
              <br />
              <strong>לא ניתן לבטל פעולה זו!</strong>
            </AlertDescription>
          </Alert>

          <Tabs value={deleteMode} onValueChange={(value) => {
            setDeleteMode(value as 'week' | 'range');
            setShowPreview(false);
            setShiftsToDelete([]);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="week">שבוע שלם</TabsTrigger>
              <TabsTrigger value="range">טווח מותאם</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="week-select" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  בחר שבוע למחיקה
                </Label>
                <Input
                  id="week-select"
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => {
                    setSelectedWeek(e.target.value);
                    setShowPreview(false);
                    setShiftsToDelete([]);
                  }}
                  disabled={isDeleting}
                />
                {selectedWeek && (
                  <p className="text-sm text-gray-600">
                    תקופה: {formatWeekRange(selectedWeek)}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">תאריך התחלה</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setShowPreview(false);
                      setShiftsToDelete([]);
                    }}
                    disabled={isDeleting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">תאריך סיום</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setShowPreview(false);
                      setShiftsToDelete([]);
                    }}
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {((deleteMode === 'week' && selectedWeek) || (deleteMode === 'range' && startDate && endDate)) && !showPreview && (
            <Button
              onClick={handlePreviewShifts}
              variant="outline"
              className="w-full"
              disabled={isDeleting}
            >
              הצג משמרות לתקופה זו
            </Button>
          )}

          {showPreview && (
            <div className="space-y-3">
              <h4 className="font-medium">
                נמצאו {shiftsToDelete.length} משמרות למחיקה בתקופה הנבחרת:
              </h4>
              
              {shiftsToDelete.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
                  {shiftsToDelete.map((shift) => (
                    <div key={shift.id} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="font-medium">
                        {new Date(shift.shift_date).toLocaleDateString('he-IL')} - 
                        {shift.start_time} עד {shift.end_time}
                      </div>
                      <div className="text-gray-600">
                        עובד: {shift.employee?.first_name} {shift.employee?.last_name} | 
                        סניף: {shift.branch?.name || 'לא משויך'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  לא נמצאו משמרות בתקופה זו
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            {showPreview && shiftsToDelete.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteShifts}
                disabled={isDeleting}
              >
                {isDeleting ? 'מוחק...' : `מחק ${shiftsToDelete.length} משמרות`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
