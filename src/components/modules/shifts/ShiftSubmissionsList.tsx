import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const ShiftSubmissionsList: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!businessId) return;

      setIsLoading(true);
      try {
        const supabase = createClient('https://xmhmztipuvzmwgbcovch.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaG16dGlwdXZ6bXdnYmNvdmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjkzODIsImV4cCI6MjA2NDcwNTM4Mn0.QEugxUTGlJ1rnG8ddf3E6BIpNaiqwkp2ml7MbiUfY9c');
        
        // Fetch submissions by joining with employees table to filter by business_id
        const { data, error } = await supabase
          .from('shift_submissions')
          .select(`
            *,
            employees!inner(
              id,
              first_name,
              last_name,
              business_id
            )
          `)
          .eq('employees.business_id', businessId)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('Error fetching shift submissions:', error);
          setError(error);
        } else {
          console.log('Fetched submissions:', data);
          setSubmissions(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [businessId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          הוגש
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          אושר
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          דחוי
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: he });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: he });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">טוען הגשות...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">שגיאה בטעינת ההגשות</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">אין הגשות עדיין</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">הגשות משמרות</h2>
        <Badge variant="outline" className="text-sm">
          {submissions.length} הגשות
        </Badge>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission: any) => {
          const shifts = Array.isArray(submission.shifts) ? submission.shifts : [];
          const morningAvailability = Array.isArray(submission.optional_morning_availability) 
            ? submission.optional_morning_availability 
            : [];

          return (
            <Card key={submission.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {submission.employees?.first_name && submission.employees?.last_name 
                      ? `${submission.employees.first_name} ${submission.employees.last_name}`
                      : 'עובד אנונימי'
                    }
                  </CardTitle>
                  {getStatusBadge(submission.status)}
                </div>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    שבוע {formatDate(submission.week_start_date)} - {formatDate(submission.week_end_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    הוגש: {formatDateTime(submission.submitted_at)}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">משמרות נבחרות ({shifts.length}):</h4>
                    <div className="grid gap-2">
                      {shifts.map((shift: any, index: number) => (
                        <div key={index} className="bg-muted p-3 rounded-lg text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatDate(shift.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{shift.start_time} - {shift.end_time}</span>
                            </div>
                          </div>
                          
                          {shift.branch_preference && (
                            <div className="mt-1 text-muted-foreground">
                              📍 {shift.branch_preference}
                            </div>
                          )}
                          
                          {shift.role_preference && (
                            <div className="mt-1 text-muted-foreground">
                              👔 {shift.role_preference}
                            </div>
                          )}
                          
                          {shift.notes && (
                            <div className="mt-1 text-muted-foreground">
                              💬 {shift.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {submission.notes && (
                    <div>
                      <h4 className="font-medium mb-1">הערות כלליות:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {morningAvailability.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">זמינות בוקר אופציונלית:</h4>
                      <div className="flex gap-1 flex-wrap">
                        {morningAvailability.map((day: any) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            יום {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};