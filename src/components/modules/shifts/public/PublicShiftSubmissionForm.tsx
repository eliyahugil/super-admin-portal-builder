
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployeeCompatibleShifts, CompatibleShift } from '@/hooks/useEmployeeCompatibleShifts';
import { useShiftSubmission } from '@/hooks/useShiftSubmission';
import { ShiftsByDayView } from './ShiftsByDayView';
import { Loader2, Send, User, Calendar, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublicShiftSubmissionFormProps {
  token: string;
}

export const PublicShiftSubmissionForm: React.FC<PublicShiftSubmissionFormProps> = ({ token }) => {
  const [selectedShifts, setSelectedShifts] = useState<CompatibleShift[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: compatibleData, isLoading, error } = useEmployeeCompatibleShifts(token);
  const submitShifts = useShiftSubmission();
  const { toast } = useToast();

  // Auto-select shifts when data is loaded
  useEffect(() => {
    if (compatibleData && compatibleData.shiftsByDay) {
      const autoSelectedShifts: CompatibleShift[] = [];
      
      Object.values(compatibleData.shiftsByDay).forEach(dayData => {
        if (dayData.autoSelectedShifts) {
          autoSelectedShifts.push(...dayData.autoSelectedShifts);
        }
      });

      if (autoSelectedShifts.length > 0) {
        console.log('🎯 Auto-selecting shifts:', autoSelectedShifts.length);
        setSelectedShifts(autoSelectedShifts);
      }
    }
  }, [compatibleData]);

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
      // Calculate the actual date for each shift based on day_of_week and week_start
      const weekStart = new Date(compatibleData.tokenData.weekStart);
      
      const shiftData = selectedShifts.map(shift => {
        const shiftDate = new Date(weekStart);
        shiftDate.setDate(shiftDate.getDate() + shift.day_of_week);
        
        return {
          shift_id: shift.id,
          date: shiftDate.toISOString().split('T')[0],
          start_time: shift.start_time,
          end_time: shift.end_time,
          branch_preference: shift.branch.name,
          role_preference: shift.shift_type,
          available: true
        };
      });

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
        description: `${selectedShifts.length} משמרות נקלטו במערכת`,
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
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">טוען משמרות זמינות...</p>
          <p className="text-sm text-gray-500 mt-2">אנא המתן, אנחנו מחפשים את המשמרות המתאימות עבורך</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">שגיאה בטעינת המשמרות</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            נסה שוב
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!compatibleData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">לא נמצאו משמרות</h3>
          <p className="text-gray-600">אין משמרות זמינות להגשה כרגע</p>
        </CardContent>
      </Card>
    );
  }

  const { tokenData, shiftsByDay, totalCompatibleShifts, totalSpecialShifts } = compatibleData;

  // Calculate total auto-selected shifts
  const totalAutoSelected = Object.values(shiftsByDay).reduce((sum, dayData) => {
    return sum + (dayData.autoSelectedShifts?.length || 0);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <User className="h-7 w-7 text-blue-600" />
            הגשת משמרות - {tokenData.employee.first_name} {tokenData.employee.last_name}
          </CardTitle>
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>שבוע: {new Date(tokenData.weekStart).toLocaleDateString('he-IL')} - {new Date(tokenData.weekEnd).toLocaleDateString('he-IL')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>תוקף עד: {new Date(tokenData.expiresAt).toLocaleString('he-IL')}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg py-2 px-4">
                {totalCompatibleShifts} משמרות זמינות
              </Badge>
              {totalAutoSelected > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 text-lg py-2 px-4">
                  <Sparkles className="h-4 w-4 mr-1" />
                  {totalAutoSelected} מומלצות
                </Badge>
              )}
              {totalSpecialShifts > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 text-lg py-2 px-4">
                  {totalSpecialShifts} משמרות מיוחדות
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium text-gray-700">נבחרו:</span>
              <Badge variant="secondary" className="text-lg py-2 px-4">
                {selectedShifts.length} משמרות
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-base">
          <strong>הנחיות:</strong> המערכת בחרה עבורך משמרות מומלצות על סמך הזמינות שלך. 
          תוכל לבטל או להוסיף משמרות לפי הצורך. משמרות מומלצות מסומנות בירוק.
        </AlertDescription>
      </Alert>

      {/* Shifts by Day */}
      <ShiftsByDayView
        shiftsByDay={shiftsByDay}
        onShiftToggle={handleShiftToggle}
        selectedShifts={selectedShifts}
      />

      {/* Notes and Submit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">הערות נוספות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות נוספות או בקשות מיוחדות (אופציונלי)"
            rows={4}
            className="text-base"
          />
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-base text-gray-600">
              {selectedShifts.length > 0 
                ? `${selectedShifts.length} משמרות נבחרו להגשה` 
                : 'לא נבחרו משמרות'
              }
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selectedShifts.length === 0 || isSubmitting}
              className="flex items-center gap-3 text-lg py-6 px-8"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              הגש משמרות
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
