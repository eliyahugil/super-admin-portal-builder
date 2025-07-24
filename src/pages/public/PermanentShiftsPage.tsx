import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { usePermanentTokens } from '@/hooks/usePermanentTokens';

const PermanentShiftsPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { validatePermanentToken, getPermanentTokenShifts } = usePermanentTokens();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [shiftsData, setShiftsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadTokenAndShifts();
    }
  }, [token]);

  const loadTokenAndShifts = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Validating permanent token...');
      
      // First validate the token
      const tokenValidation = await validatePermanentToken.mutateAsync({ token });
      
      if (!tokenValidation.success) {
        throw new Error('טוקן לא תקין');
      }

      setTokenData(tokenValidation.tokenData);
      console.log('✅ Token validated successfully');

      // Then get the shifts
      console.log('📅 Getting shifts for permanent token...');
      const shiftsResponse = await getPermanentTokenShifts.mutateAsync({ token });
      
      if (!shiftsResponse.success) {
        throw new Error('שגיאה בטעינת משמרות');
      }

      setShiftsData(shiftsResponse);
      console.log('✅ Shifts loaded successfully');

    } catch (error) {
      console.error('❌ Error loading token/shifts:', error);
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : 'שגיאה בטעינת הנתונים',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTokenAndShifts();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען נתונים...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">שגיאה</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employee = tokenData?.employee;
  const availableShifts = shiftsData?.availableShifts || [];
  const scheduledShifts = shiftsData?.scheduledShifts || [];
  const context = shiftsData?.context || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            משמרות ואזור אישי
          </h1>
          <p className="text-gray-600">
            צפייה במשמרות זמינות וסידור עבודה אישי
          </p>
        </div>

        {/* Employee Info */}
        {employee && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-muted-foreground">
                      {employee.business?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Star className="h-3 w-3 mr-1" />
                    טוקן קבוע
                  </Badge>
                  <Badge variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    שימושים: {tokenData.usesCount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                משמרות זמינות להגשה
              </CardTitle>
            </CardHeader>
            <CardContent>
              {context.error === 'NO_BRANCH_ASSIGNMENTS' ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אינך משויך לאף סניף כעת
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    יש לפנות למנהל להשמה בסניף
                  </p>
                </div>
              ) : availableShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אין משמרות זמינות כרגע
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {context.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      נמצאו {availableShifts.length} משמרות זמינות לשבוע הקרוב
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      שבוע {context.weekStart} עד {context.weekEnd}
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    {availableShifts.map((shift: any) => (
                      <div key={shift.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {shift.shift_type}
                            </Badge>
                            <span className="text-sm font-medium">
                              יום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][shift.day_of_week]}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                          </div>
                        </div>
                        
                        {shift.branch && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shift.branch.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                הסידור האישי שלך
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    אין לך משמרות מתוכננות השבוע
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      יש לך {scheduledShifts.length} משמרות מתוכננות השבוע
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    {scheduledShifts.map((shift: any) => (
                      <div key={shift.id} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {shift.status === 'approved' ? 'אושר' : 'ממתין'}
                            </Badge>
                            <span className="font-medium">
                              {format(new Date(shift.shift_date), 'EEEE, dd/MM', { locale: he })}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                          </div>
                        </div>
                        
                        {shift.branch && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shift.branch.name}
                          </div>
                        )}
                        
                        {shift.role && (
                          <div className="text-xs text-muted-foreground mt-1">
                            תפקיד: {shift.role}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Button onClick={handleRefresh} variant="outline" className="mr-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            רענן נתונים
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>זהו הטוקן האישי הקבוע שלך - שמור אותו במקום בטוח</p>
          <p className="mt-1">עדכונים אוטומטיים מהמערכת | שימוש #{tokenData?.usesCount}</p>
        </div>
      </div>
    </div>
  );
};

export default PermanentShiftsPage;