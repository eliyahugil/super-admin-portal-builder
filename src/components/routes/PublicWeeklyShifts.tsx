import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeTokens } from '@/hooks/useEmployeeTokens';
import { Calendar, User, Clock, Building, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const PublicWeeklyShifts: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { getWeeklyShifts } = useEmployeeTokens();
  const [tokenData, setTokenData] = useState<any>(null);
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyShifts = async (weekStart?: string) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading weekly shifts for token:', token, 'week:', weekStart);
      
      const result = await getWeeklyShifts.mutateAsync({
        token,
        week_start_date: weekStart
      });

      console.log('✅ Received shifts data:', result);
      
      setTokenData(result.tokenData);
      setAvailableShifts(result.shifts || []);
      
      if (result.context?.error) {
        setError(result.context.description || 'שגיאה בטעינת המשמרות');
      }
      
    } catch (err: any) {
      console.error('❌ Error loading weekly shifts:', err);
      setError(err.message || 'שגיאה בטעינת המשמרות');
      toast({
        title: 'שגיאה',
        description: err.message || 'לא ניתן לטעון את המשמרות',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyShifts();
  }, [token]);

  const handleWeekChange = (weekStart: string) => {
    setSelectedWeek(weekStart);
    loadWeeklyShifts(weekStart);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayOfWeek] || 'יום לא ידוע';
  };

  const getNextWeeks = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (i * 7));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      weeks.push({
        start: format(startOfWeek, 'yyyy-MM-dd'),
        end: format(endOfWeek, 'yyyy-MM-dd'),
        label: i === 0 ? 'השבוע הנוכחי' : i === 1 ? 'השבוע הבא' : `בעוד ${i} שבועות`,
        dateRange: `${format(startOfWeek, 'd/M')} - ${format(endOfWeek, 'd/M')}`
      });
    }
    
    return weeks;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg">טוען משמרות...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-xl font-semibold text-red-800 mb-2">שגיאה בטעינת המשמרות</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => loadWeeklyShifts()} variant="outline">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  נסה שוב
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const weeks = getNextWeeks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Calendar className="h-6 w-6" />
              הגשת משמרות שבועיות
            </CardTitle>
            {tokenData?.employee && (
              <div className="flex items-center gap-2 text-blue-100">
                <User className="h-4 w-4" />
                <span>{tokenData.employee.first_name} {tokenData.employee.last_name}</span>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Week Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              בחר שבוע להגשה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeks.map((week) => (
                <Button
                  key={week.start}
                  variant={selectedWeek === week.start ? "default" : "outline"}
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => handleWeekChange(week.start)}
                >
                  <div className="font-medium">{week.label}</div>
                  <div className="text-sm opacity-80">{week.dateRange}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Week Info */}
        {tokenData && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  טוקן תקף לשבוע: {tokenData.weekStart} - {tokenData.weekEnd}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Shifts */}
        {error ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800 mb-2">{error}</h3>
                <Button onClick={() => loadWeeklyShifts(selectedWeek)} variant="outline">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  רענן
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : availableShifts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                משמרות זמינות ({availableShifts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableShifts.map((shift) => (
                  <Card key={shift.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{getDayName(shift.day_of_week)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span>{shift.start_time} - {shift.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-purple-600" />
                            <span>{shift.branch?.name || 'לא צוין'}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            סוג משמרת: {shift.shift_type}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">עובדים נדרשים</p>
                          <p className="text-lg font-bold">
                            {shift.current_assignments}/{shift.required_employees}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">אין משמרות זמינות</h3>
                <p className="text-gray-500 mb-4">אין משמרות זמינות לשבוע הנבחר</p>
                <Button onClick={() => loadWeeklyShifts(selectedWeek)} variant="outline">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  רענן
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};