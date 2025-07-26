
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar, Clock, Building, User, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ShiftPreference } from '@/types/publicShift';
import EmployeeNameDialog from '@/components/shared/EmployeeNameDialog';

interface LocalShiftPreference extends ShiftPreference {
  shift_id: string;
  shift_date: string;
  branch_name: string;
  role: string;
  is_selected: boolean;
}

const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useToken, useTokenAvailableShifts, submitShifts, useTokenSubmissions } = usePublicShifts();
  
  const [preferences, setPreferences] = useState<LocalShiftPreference[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');

  // Get token details
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useToken(token || '');
  
  // Get available shifts for the token
  const { data: availableShifts = [], isLoading: shiftsLoading } = useTokenAvailableShifts(tokenData?.id || '');

  // Check if there's already a submission for this token
  const { data: existingSubmissions = [] } = useTokenSubmissions(tokenData?.id || '');
  const hasExistingSubmission = existingSubmissions.length > 0;

  // Initialize preferences when shifts are loaded
  useEffect(() => {
    if (availableShifts.length > 0 && tokenData) {
      const initialPreferences: LocalShiftPreference[] = availableShifts.map(shift => {
        // Calculate the actual date based on day_of_week and week_start_date
        const weekStart = new Date(tokenData.week_start_date);
        const shiftDate = addDays(weekStart, shift.day_of_week);
        
        return {
          shift_id: shift.id,
          shift_date: format(shiftDate, 'yyyy-MM-dd'),
          start_time: shift.start_time,
          end_time: shift.end_time,
          branch_name: shift.branches?.name || '',
          role: shift.shift_name || 'משמרת',
          available: true,
          is_selected: false
        };
      });
      setPreferences(initialPreferences);
    }
  }, [availableShifts, tokenData]);

  // Handle shift selection toggle
  const toggleShiftSelection = (shiftId: string) => {
    if (hasExistingSubmission) return; // Prevent changes if already submitted
    
    setPreferences(prev => 
      prev.map(pref => 
        pref.shift_id === shiftId 
          ? { ...pref, is_selected: !pref.is_selected }
          : pref
      )
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא טוקן תקין',
        variant: 'destructive',
      });
      return;
    }

    const selectedPreferences = preferences.filter(pref => pref.is_selected);
    
    if (selectedPreferences.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור לפחות משמרת אחת',
        variant: 'destructive',
      });
      return;
    }

    // Show employee name dialog if not already provided
    if (!employeeName) {
      setShowNameDialog(true);
      return;
    }

    await performSubmission(selectedPreferences);
  };

  // Handle name confirmation
  const handleNameConfirm = async (name: string, phone?: string) => {
    setEmployeeName(name);
    setEmployeePhone(phone || '');
    setShowNameDialog(false);
    
    const selectedPreferences = preferences.filter(pref => pref.is_selected);
    await performSubmission(selectedPreferences, name, phone);
  };

  // Perform the actual submission
  const performSubmission = async (selectedPreferences: LocalShiftPreference[], name?: string, phone?: string) => {
    setIsSubmitting(true);
    
    try {
      await submitShifts.mutateAsync({
        token: token!,
        formData: {
          employee_name: name || employeeName,
          phone: phone || employeePhone,
          preferences: selectedPreferences,
          notes
        }
      });
      
      toast({
        title: 'הגשה בוצעה בהצלחה',
        description: 'המשמרות שלך נשלחו לאישור',
        variant: 'default',
      });
      
      // Redirect to success page or home
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'שגיאה בהגשה',
        description: error instanceof Error ? error.message : 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (tokenLoading || shiftsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען נתונים...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">טוקן לא תקין</h2>
              <p className="text-muted-foreground">
                הטוקן שפג תוקפו או אינו קיים במערכת
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already submitted state
  if (hasExistingSubmission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold">הגשה כבר בוצעה</h2>
              <p className="text-muted-foreground">
                כבר הגשת את בחירת המשמרות שלך עבור השבוע הנבחר
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  הגשה בוצעה בתאריך: {format(new Date(existingSubmissions[0].submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group shifts by date
  const groupedShifts = preferences.reduce((acc, pref) => {
    const date = pref.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(pref);
    return acc;
  }, {} as Record<string, LocalShiftPreference[]>);

  const selectedCount = preferences.filter(pref => pref.is_selected).length;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">הגשת העדפות משמרות</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {tokenData.week_start_date && tokenData.week_end_date && (
                    <>
                      שבוע {format(new Date(tokenData.week_start_date), 'dd/MM', { locale: he })} - {format(new Date(tokenData.week_end_date), 'dd/MM/yyyy', { locale: he })}
                    </>
                  )}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shifts Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>בחירת משמרות</span>
                <Badge variant="secondary">
                  {selectedCount} נבחרו
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedShifts).length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אין משמרות זמינות עבור השבוע הנבחר
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedShifts).map(([date, shifts]) => (
                    <div key={date} className="space-y-3">
                      <h3 className="font-medium text-lg border-b pb-2">
                        {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: he })}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {shifts.map(shift => (
                          <div
                            key={shift.shift_id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              shift.is_selected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => toggleShiftSelection(shift.shift_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {shift.start_time} - {shift.end_time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {shift.branch_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {shift.role}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {shift.is_selected ? (
                                  <CheckCircle className="h-6 w-6 text-primary" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>הערות נוספות</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="הוסף הערות או העדפות נוספות..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
                disabled={hasExistingSubmission}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || selectedCount === 0 || hasExistingSubmission}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    שולח...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    שלח הגשה ({selectedCount} משמרות)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Employee Name Dialog */}
        <EmployeeNameDialog
          isOpen={showNameDialog}
          onClose={() => setShowNameDialog(false)}
          onConfirm={handleNameConfirm}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default PublicShiftSubmission;
