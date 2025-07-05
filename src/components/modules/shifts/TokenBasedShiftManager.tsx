
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShiftSubmissionCalendar } from './ShiftSubmissionCalendar';
import { VacationRequestForm } from './VacationRequestForm';
import { User, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  phone?: string;
  business_id: string;
}

interface TokenData {
  id: string;
  employee_id: string;
  token: string;
  expires_at: string;
  is_used: boolean;
  week_start_date: string;
  week_end_date: string;
  employee: Employee;
}

interface SelectedShift {
  date: Date;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchName: string;
}

interface VacationRequest {
  startDate: Date;
  endDate: Date;
  reason: string;
  notes?: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'military';
}

type ViewMode = 'calendar' | 'vacation' | 'submitted';

export const TokenBasedShiftManager: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('🔍 Validating token:', token);
      
      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select(`
          *,
          employee:employees(
            id, 
            first_name, 
            last_name, 
            employee_id, 
            phone,
            business_id
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        console.error('❌ Token validation failed:', error);
        toast({
          title: 'טוקן לא תקין',
          description: 'הטוקן פג תוקף או כבר נוצל',
          variant: 'destructive',
        });
        return;
      }

      // Validate that we have all required employee data
      if (!data.employee || !data.employee.business_id) {
        console.error('❌ Missing employee or business data:', data);
        toast({
          title: 'שגיאה בנתוני המשתמש',
          description: 'חסרים פרטי עובד או עסק. אנא פנה למנהל המערכת.',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Token validated successfully:', {
        tokenId: data.id,
        employeeId: data.employee.id,
        businessId: data.employee.business_id,
        employeeName: `${data.employee.first_name} ${data.employee.last_name}`
      });

      // Map the data to match TokenData interface
      const mappedTokenData: TokenData = {
        ...data,
        is_used: !data.is_active // Convert is_active to is_used (inverse logic)
      };

      setTokenData(mappedTokenData);
      
    } catch (error) {
      console.error('💥 Error validating token:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בבדיקת הטוקן',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShiftSubmission = async (shifts: SelectedShift[]) => {
    if (!tokenData || !token) {
      console.error('❌ Missing token data for shift submission');
      toast({
        title: 'שגיאה',
        description: 'חסרים נתוני טוקן',
        variant: 'destructive',
      });
      return;
    }

    // Validate employee data before submission
    if (!tokenData.employee || !tokenData.employee.business_id) {
      console.error('❌ Missing employee business data:', tokenData.employee);
      toast({
        title: 'שגיאה בנתוני המשתמש',
        description: 'חסרים פרטי עסק של העובד. אנא פנה למנהל המערכת.',
        variant: 'destructive',
      });
      return;
    }

    console.log('📊 Submitting shifts:', {
      shiftsCount: shifts.length,
      employeeId: tokenData.employee_id,
      businessId: tokenData.employee.business_id,
      employeeName: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`
    });

    setSubmitting(true);
    try {
      // Save shifts to database with all required data
      const shiftInserts = shifts.map(shift => ({
        employee_id: tokenData.employee_id,
        shift_date: shift.date.toISOString().split('T')[0],
        start_time: shift.startTime,
        end_time: shift.endTime,
        branch_preference: shift.branchName,
        notes: `משמרת נבחרה דרך טוקן מתקדם - ${shift.shiftName}`,
        status: 'pending',
        submission_token: tokenData.id, // Add token reference
        created_at: new Date().toISOString()
      }));

      console.log('💾 Inserting shift requests:', shiftInserts);

      const { error: shiftError } = await supabase
        .from('employee_shift_requests')
        .insert(shiftInserts);

      if (shiftError) {
        console.error('❌ Error inserting shifts:', shiftError);
        throw shiftError;
      }

      console.log('✅ Shifts inserted successfully');

      // Mark token as used
      const { error: updateError } = await supabase
        .from('employee_weekly_tokens')
        .update({ 
          is_active: false,
        })
        .eq('token', token);

      if (updateError) {
        console.error('❌ Error updating token:', updateError);
        throw updateError;
      }

      console.log('✅ Token marked as used');

      toast({
        title: 'הצלחה!',
        description: `${shifts.length} משמרות נשלחו בהצלחה עבור ${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      });

      setViewMode('submitted');

    } catch (error) {
      console.error('💥 Error submitting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת המשמרות. נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacationRequest = async (request: VacationRequest) => {
    if (!tokenData) {
      console.error('❌ Missing token data for vacation request');
      return;
    }

    // Validate employee data
    if (!tokenData.employee || !tokenData.employee.business_id) {
      console.error('❌ Missing employee business data for vacation request');
      toast({
        title: 'שגיאה בנתוני המשתמש',
        description: 'חסרים פרטי עסק של העובד. אנא פנה למנהל המערכת.',
        variant: 'destructive',
      });
      return;
    }

    console.log('🏖️ Submitting vacation request:', {
      employeeId: tokenData.employee_id,
      businessId: tokenData.employee.business_id,
      requestType: request.type,
      startDate: request.startDate.toISOString().split('T')[0],
      endDate: request.endDate.toISOString().split('T')[0]
    });

    try {
      setSubmitting(true);
      
      // Save vacation request to database with all required data
      const { error } = await supabase
        .from('employee_requests')
        .insert({
          employee_id: tokenData.employee_id,
          request_type: 'vacation',
          subject: `בקשת ${request.type} - ${request.reason}`,
          description: request.notes,
          request_data: {
            start_date: request.startDate.toISOString().split('T')[0],
            end_date: request.endDate.toISOString().split('T')[0],
            vacation_type: request.type,
            reason: request.reason,
            business_id: tokenData.employee.business_id, // Include business_id
            employee_name: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`
          },
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error submitting vacation request:', error);
        throw error;
      }

      console.log('✅ Vacation request submitted successfully');

      toast({
        title: 'בקשת חופשה נשלחה!',
        description: `בקשה לחופשה מ-${request.startDate.toLocaleDateString('he-IL')} עד ${request.endDate.toLocaleDateString('he-IL')} עבור ${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      });

      setViewMode('calendar');
    } catch (error) {
      console.error('💥 Error submitting vacation request:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת בקשת החופשה. נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">בודק טוקן...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">טוקן לא תקין</h2>
            <p className="text-gray-600">הטוקן פג תוקף או כבר נוצל</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (viewMode === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">נשלח בהצלחה!</h2>
            <p className="text-gray-600 mb-2">
              הבקשות של {tokenData.employee.first_name} {tokenData.employee.last_name} נשלחו בהצלחה
            </p>
            <p className="text-sm text-gray-500 mb-4">מס' עובד: {tokenData.employee.employee_id}</p>
            <Button 
              onClick={() => navigate('/shift-submitted')}
              className="w-full"
            >
              סיים
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">
                    מערכת הגשת משמרות מתקדמת
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {tokenData.employee.first_name} {tokenData.employee.last_name} | 
                    מס' עובד: {tokenData.employee.employee_id}
                    {tokenData.employee.phone && ` | טלפון: ${tokenData.employee.phone}`}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    שבוע: {formatDate(tokenData.week_start_date)} - {formatDate(tokenData.week_end_date)}
                  </span>
                </div>
                <Badge variant="outline" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  פעיל עד: {new Date(tokenData.expires_at).toLocaleDateString('he-IL')}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                בחירת משמרות
              </Button>
              <Button
                variant={viewMode === 'vacation' ? 'default' : 'outline'}
                onClick={() => setViewMode('vacation')}
                className="flex-1"
              >
                בקשת חופשה
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <ShiftSubmissionCalendar
            businessId={tokenData.employee.business_id}
            onSubmit={handleShiftSubmission}
            onVacationRequest={() => setViewMode('vacation')}
            submitting={submitting}
            weekRange={{
              start: new Date(tokenData.week_start_date),
              end: new Date(tokenData.week_end_date)
            }}
          />
        ) : (
          <VacationRequestForm
            onSubmit={handleVacationRequest}
            onCancel={() => setViewMode('calendar')}
          />
        )}
      </div>
    </div>
  );
};
