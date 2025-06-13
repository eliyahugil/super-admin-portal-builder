
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ShiftSubmissionHistoryProps {
  employeeId: string;
}

export const ShiftSubmissionHistory: React.FC<ShiftSubmissionHistoryProps> = ({ employeeId }) => {
  console.log('🔍 ShiftSubmissionHistory - Props:', { employeeId });

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['shift-submissions', employeeId],
    queryFn: async () => {
      console.log('🔍 ShiftSubmissionHistory - Fetching submissions for employee:', employeeId);
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('❌ ShiftSubmissionHistory - Error fetching submissions:', error);
        throw error;
      }

      console.log('✅ ShiftSubmissionHistory - Fetched submissions:', {
        count: data?.length || 0,
        submissions: data
      });

      return data;
    },
    enabled: !!employeeId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'אושר';
      case 'rejected': return 'נדחה';
      case 'pending': return 'ממתין';
      default: return 'הוגש';
    }
  };

  const parseShifts = (shifts: any) => {
    if (typeof shifts === 'string') {
      try {
        return JSON.parse(shifts);
      } catch {
        return [];
      }
    }
    return Array.isArray(shifts) ? shifts : [];
  };

  if (isLoading) {
    console.log('⏳ ShiftSubmissionHistory - Loading...');
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ ShiftSubmissionHistory - Error state:', error);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">שגיאה בטעינת הגשות משמרות</h3>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת הנתונים</h3>
            <p className="text-gray-500">לא ניתן לטעון את הגשות המשמרות. נסה לרענן את הדף.</p>
            <p className="text-sm text-gray-400 mt-2">שגיאה: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('📊 ShiftSubmissionHistory - Rendering with submissions:', submissions);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">היסטוריית הגשות משמרות</h3>
        <Badge variant="outline" className="ml-2">
          {submissions?.length || 0} הגשות
        </Badge>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const shiftsData = parseShifts(submission.shifts);
            console.log('📝 ShiftSubmissionHistory - Processing submission:', {
              id: submission.id,
              weekStart: submission.week_start_date,
              weekEnd: submission.week_end_date,
              shiftsCount: shiftsData.length,
              status: submission.status
            });

            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      שבוע {format(new Date(submission.week_start_date), 'dd/MM', { locale: he })} - 
                      {format(new Date(submission.week_end_date), 'dd/MM/yyyy', { locale: he })}
                    </CardTitle>
                    <Badge className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {getStatusLabel(submission.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">תאריך הגשה:</span>
                      <div className="font-medium">
                        {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">מספר משמרות:</span>
                      <div className="font-medium">
                        {shiftsData.length}
                      </div>
                    </div>
                  </div>
                  
                  {submission.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <span className="text-gray-500 text-sm">הערות:</span>
                      <p className="text-sm mt-1">{submission.notes}</p>
                    </div>
                  )}

                  {shiftsData.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">משמרות:</span>
                      <div className="mt-2 space-y-2">
                        {shiftsData.map((shift: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                            <span>{shift.date || 'תאריך לא זמין'}</span>
                            <span>{shift.start_time || shift.startTime} - {shift.end_time || shift.endTime}</span>
                            {(shift.branch_preference || shift.branch) && (
                              <span className="text-blue-600">{shift.branch_preference || shift.branch}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הגשות משמרות</h3>
            <p className="text-gray-500">העובד עדיין לא הגיש משמרות במערכת</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
