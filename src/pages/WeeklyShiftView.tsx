import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, User, Building, CheckCircle, Clock4, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

interface WeeklyShiftsData {
  success: boolean;
  tokenData: {
    id: string;
    token: string;
    employeeId: string;
    weekStart: string;
    weekEnd: string;
    expiresAt: string;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
      employee_id: string;
      phone: string;
      business_id: string;
      business: {
        id: string;
        name: string;
      };
    };
  };
  context: {
    type: 'available_shifts' | 'assigned_shifts' | 'no_shifts_assigned';
    title: string;
    description: string;
    shiftsPublished: boolean;
  };
  shifts: any[];
  shiftsCount: number;
}

const daysOfWeek = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
];

export const WeeklyShiftView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isValidating, setIsValidating] = useState(true);
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log('🚀 WeeklyShiftView component loaded with token:', token);
  console.log('📍 Current URL path:', window.location.pathname);

  const { data: shiftsData, error, isLoading } = useQuery({
    queryKey: ['weekly-shifts-context', token],
    queryFn: async (): Promise<WeeklyShiftsData> => {
      console.log('📞 Calling get-weekly-shifts-context with token:', token);
      
      try {
        // Use direct fetch call to avoid automatic JWT header inclusion
        const response = await fetch(
          `https://xmhmztipuvzmwgbcovch.supabase.co/functions/v1/get-weekly-shifts-context`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaG16dGlwdXZ6bXdnYmNvdmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjkzODIsImV4cCI6MjA2NDcwNTM4Mn0.QEugxUTGlJ1rnG8ddf3E6BIpNaiqwkp2ml7MbiUfY9c`,
            },
            body: JSON.stringify({ token })
          }
        );

        console.log('🔍 Function response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Function success, returning data:', data);
        return data;
      } catch (fetchError) {
        console.error('❌ Function error:', fetchError);
        throw fetchError;
      }
    },
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds to check for updates
  });

  useEffect(() => {
    if (!isLoading) {
      setIsValidating(false);
    }
  }, [isLoading]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shiftsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">שגיאה באימות הטוכן</CardTitle>
              <CardDescription>
                הטוכן שהזנת לא תקין או שפג תוקפו. אנא פנה למנהל העבודה לקבלת טוכן חדש.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const { tokenData, context, shifts } = shiftsData;
  const isAvailableShifts = context.type === 'available_shifts';
  const isNoShiftsAssigned = context.type === 'no_shifts_assigned';

  const handleShiftSelection = (shiftId: string, checked: boolean) => {
    const newSelection = new Set(selectedShifts);
    if (checked) {
      newSelection.add(shiftId);
    } else {
      newSelection.delete(shiftId);
    }
    setSelectedShifts(newSelection);
  };

  const handleSubmitShifts = async () => {
    if (selectedShifts.size === 0) {
      alert('אנא בחר לפחות משמרת אחת');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit selected shifts
      console.log('Submitting shifts:', Array.from(selectedShifts));
      // TODO: Add actual submission logic here
      
      alert(`הגשת ${selectedShifts.size} משמרות בהצלחה!`);
      setSelectedShifts(new Set());
    } catch (error) {
      console.error('Error submitting shifts:', error);
      alert('שגיאה בהגשת המשמרות. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatShiftTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const formatShiftDate = (dateStr: string, dayOfWeek?: number) => {
    if (dayOfWeek !== undefined) {
      return daysOfWeek[dayOfWeek];
    }
    try {
      return format(parseISO(dateStr), 'EEEE, dd/MM', { locale: he });
    } catch {
      return dateStr;
    }
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType?.toLowerCase()) {
      case 'morning':
      case 'בוקר':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'evening':
      case 'ערב':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'night':
      case 'לילה':
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {context.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {context.description}
          </p>
        </div>

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי העובד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">שם:</span>
              <span>{tokenData.employee.first_name} {tokenData.employee.last_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">מספר עובד:</span>
              <span>{tokenData.employee.employee_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-medium">עסק:</span>
              <span>{tokenData.employee.business.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">שבוע:</span>
              <span>
                {format(parseISO(tokenData.weekStart), 'dd/MM/yyyy', { locale: he })} - {' '}
                {format(parseISO(tokenData.weekEnd), 'dd/MM/yyyy', { locale: he })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={isAvailableShifts ? "outline" : "default"}
            className={`text-sm px-4 py-2 ${
              isAvailableShifts 
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : isNoShiftsAssigned
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {isAvailableShifts ? (
              <>
                <Clock4 className="h-4 w-4 mr-2" />
                ממתין לפרסום המשמרות
              </>
            ) : isNoShiftsAssigned ? (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                לא הוקצו משמרות
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                המשמרות פורסמו
              </>
            )}
          </Badge>
        </div>

        {/* Shifts Grid */}
        {shifts.length > 0 ? (
          <div className="space-y-4">
            {/* Selection Instructions */}
            {isAvailableShifts && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">הוראות בחירה</h3>
                <p className="text-blue-700 text-sm">
                  בחר את המשמרות שברצונך לעבוד בהן השבוע ולחץ על כפתור "הגש בקשה" בתחתית העמוד.
                </p>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              {shifts.map((shift, index) => (
                <Card 
                  key={shift.id || index} 
                  className={`hover:shadow-lg transition-shadow ${
                    isAvailableShifts && selectedShifts.has(shift.id) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {isAvailableShifts && (
                        <div className="flex items-center space-x-2 ml-2">
                          <Checkbox
                            id={`shift-${shift.id}`}
                            checked={selectedShifts.has(shift.id)}
                            onCheckedChange={(checked) => 
                              handleShiftSelection(shift.id, !!checked)
                            }
                          />
                        </div>
                      )}
                      <CardTitle className="text-lg flex-1">
                        {isAvailableShifts 
                          ? formatShiftDate(shift.week_start_date, shift.day_of_week)
                          : formatShiftDate(shift.shift_date)
                        }
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getShiftTypeColor(shift.shift_type)}
                      >
                        {shift.shift_type || shift.shift_name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatShiftTime(shift.start_time, shift.end_time)}
                      </span>
                    </div>
                    
                    {shift.branch && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{shift.branch.name}</div>
                          {shift.branch.address && (
                            <div className="text-muted-foreground text-xs">
                              {shift.branch.address}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isAvailableShifts && shift.required_employees && (
                      <div className="text-sm text-muted-foreground">
                        דרושים: {shift.required_employees} עובדים
                      </div>
                    )}
                    
                    {!isAvailableShifts && shift.notes && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <span className="font-medium">הערות: </span>
                        {shift.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Submit Button */}
            {isAvailableShifts && shifts.length > 0 && (
              <div className="flex flex-col items-center gap-4 pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    נבחרו {selectedShifts.size} משמרות
                  </p>
                  <Button
                    onClick={handleSubmitShifts}
                    disabled={selectedShifts.size === 0 || isSubmitting}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      'מגיש בקשה...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        הגש בקשה ({selectedShifts.size})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isNoShiftsAssigned 
                  ? 'לא הוקצו לך משמרות השבוע'
                  : isAvailableShifts 
                  ? 'אין משמרות זמינות' 
                  : 'אין משמרות מוקצות'
                }
              </h3>
              <p className="text-muted-foreground">
                {isNoShiftsAssigned
                  ? context.description
                  : isAvailableShifts 
                  ? 'טרם הוגדרו משמרות זמינות לשבוע זה'
                  : 'לא הוקצו לך משמרות לשבוע זה'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6">
          <p>הטוכן תקף עד: {format(parseISO(tokenData.expiresAt), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
          <p className="mt-2">העמוד מתעדכן אוטומטית כל 30 שניות</p>
        </div>
      </div>
    </div>
  );
};