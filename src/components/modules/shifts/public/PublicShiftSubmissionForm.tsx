
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useEmployeeCompatibleShifts, CompatibleShift } from '@/hooks/useEmployeeCompatibleShifts';
import { useShiftSubmission } from '@/hooks/useShiftSubmission';
import { ShiftsByDayView } from './ShiftsByDayView';
import { Loader2, Send, User, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublicShiftSubmissionFormProps {
  token: string;
}

export const PublicShiftSubmissionForm: React.FC<PublicShiftSubmissionFormProps> = ({ token }) => {
  const [selectedShifts, setSelectedShifts] = useState<CompatibleShift[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: compatibleData, isLoading, error } = useEmployeeCompatibleShifts(token);
  const { submitShifts } = useShiftSubmission();
  const { toast } = useToast();

  const handleShiftToggle = (shift: CompatibleShift) => {
    setSelectedShifts(prev => {
      const isSelected = prev.some(s => s.id === shift.id);
      if (isSelected) {
        return prev.filter(s => s.id !== shift.id);
      } else {
        return [...prev, shift];
      }
    });
  };

  const handleSubmit = async () => {
    if (!compatibleData || selectedShifts.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const shiftData = selectedShifts.map(shift => ({
        shift_id: shift.id,
        date: `${compatibleData.tokenData.weekStart}`, // This should be calculated per shift
        start_time: shift.start_time,
        end_time: shift.end_time,
        branch_preference: shift.branch.name,
        role_preference: shift.shift_type,
        available: true
      }));

      await submitShifts.mutateAsync({
        token,
        employeeId: compatibleData.tokenData.employeeId,
        weekStart: compatibleData.tokenData.weekStart,
        weekEnd: compatibleData.tokenData.weekEnd,
        shifts: shiftData,
        notes
      });

      toast({
        title: 'הוגש בהצלחה!',
        description: 'הגשת המשמרות נקלטה במערכת',
      });

      // Reset form
      setSelectedShifts([]);
      setNotes('');
      
    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה בהגשה',
        description: 'אירעה שגיאה בעת הגשת המשמרות',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">טוען משמרות...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">שגיאה בטעינת המשמרות</h3>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!compatibleData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">לא נמצאו משמרות</h3>
          <p className="text-gray-600">אין משמרות זמינות להגשה כרגע</p>
        </CardContent>
      </Card>
    );
  }

  const { tokenData, shiftsByDay, totalCompatibleShifts, totalSpecialShifts } = compatibleData;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            הגשת משמרות - {tokenData.employee.first_name} {tokenData.employee.last_name}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              שבוע: {new Date(tokenData.weekStart).toLocaleDateString('he-IL')} - {new Date(tokenData.weekEnd).toLocaleDateString('he-IL')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              תוקף עד: {new Date(tokenData.expiresAt).toLocaleString('he-IL')}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {totalCompatibleShifts} משמרות זמינות
              </Badge>
              {totalSpecialShifts > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                  {totalSpecialShifts} משמרות מיוחדות
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">נבחרו:</span>
              <Badge variant="secondary">
                {selectedShifts.length} משמרות
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts by Day */}
      <ShiftsByDayView
        shiftsByDay={shiftsByDay}
        onShiftToggle={handleShiftToggle}
        selectedShifts={selectedShifts}
      />

      {/* Notes and Submit */}
      <Card>
        <CardHeader>
          <CardTitle>הערות נוספות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות נוספות (אופציונלי)"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedShifts.length > 0 ? `${selectedShifts.length} משמרות נבחרו` : 'לא נבחרו משמרות'}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selectedShifts.length === 0 || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              הגש משמרות
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
