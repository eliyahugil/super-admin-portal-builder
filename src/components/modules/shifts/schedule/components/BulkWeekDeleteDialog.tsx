
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface BulkWeekDeleteDialogProps {
  onSuccess?: () => void;
}

export const BulkWeekDeleteDialog: React.FC<BulkWeekDeleteDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [shiftsToDelete, setShiftsToDelete] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();

  const getWeekDates = (weekString: string) => {
    const date = new Date(weekString);
    const day = date.getDay();
    const diff = date.getDate() - day; // First day of week (Sunday)
    
    const weekStart = new Date(date.setDate(diff));
    const weekEnd = new Date(date.setDate(diff + 6));
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
    };
  };

  const handlePreviewWeek = async () => {
    if (!selectedWeek || !businessId) return;

    const { start, end } = getWeekDates(selectedWeek);

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
        .gte('shift_date', start)
        .lte('shift_date', end)
        .order('shift_date')
        .order('start_time');

      if (error) throw error;

      setShiftsToDelete(data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את המשמרות לשבוע הנבחר',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWeek = async () => {
    if (!selectedWeek || !businessId || shiftsToDelete.length === 0) return;

    setIsDeleting(true);

    try {
      const shiftIds = shiftsToDelete.map(shift => shift.id);
      
      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .in('id', shiftIds);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `נמחקו ${shiftsToDelete.length} משמרות בהצלחה`,
      });

      setOpen(false);
      setSelectedWeek('');
      setShiftsToDelete([]);
      setShowPreview(false);
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
    setShiftsToDelete([]);
    setShowPreview(false);
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
          מחק שבוע שלם
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            מחיקת משמרות לשבוע שלם
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>אזהרה!</strong> פעולה זו תמחק את כל המשמרות בשבוע הנבחר.
              <br />
              <strong>לא ניתן לבטל פעולה זו!</strong>
            </AlertDescription>
          </Alert>

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
          </div>

          {selectedWeek && !showPreview && (
            <Button
              onClick={handlePreviewWeek}
              variant="outline"
              className="w-full"
              disabled={isDeleting}
            >
              הצג משמרות לשבוע זה
            </Button>
          )}

          {showPreview && (
            <div className="space-y-3">
              <h4 className="font-medium">
                נמצאו {shiftsToDelete.length} משמרות למחיקה:
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
                  לא נמצאו משמרות בשבוע זה
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
                onClick={handleDeleteWeek}
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
