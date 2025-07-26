import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getStatusColor, getStatusIcon, getStatusLabel } from '../../utils/shiftSubmissionUtils';
import type { Employee } from '@/types/employee';

interface EmployeeSubmissionHistoryTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface ShiftSubmission {
  id: string;
  submission_type: string | null;
  week_start_date: string;
  week_end_date: string;
  shifts: any;
  status: string;
  submitted_at: string;
  notes: string | null;
}

export const EmployeeSubmissionHistoryTab: React.FC<EmployeeSubmissionHistoryTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['employee-submission-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          id,
          submission_type,
          week_start_date,
          week_end_date,
          shifts,
          status,
          submitted_at,
          notes
        `)
        .eq('employee_id', employeeId)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ShiftSubmission[];
    },
  });

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'd/M', { locale: he });
    const end = format(new Date(endDate), 'd/M/yyyy', { locale: he });
    return `${start} - ${end}`;
  };

  const parseShifts = (shifts: any) => {
    if (!shifts) return [];
    
    try {
      const parsedShifts = typeof shifts === 'string' ? JSON.parse(shifts) : shifts;
      return Array.isArray(parsedShifts) ? parsedShifts : [];
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            היסטוריית הגשות משמרות
          </CardTitle>
          <CardDescription>
            כל ההגשות הקודמות של {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            לא נמצאו הגשות קודמות עבור עובד זה
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            היסטוריית הגשות משמרות
          </CardTitle>
          <CardDescription>
            סה"כ {submissions.length} הגשות עבור {employeeName}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {submissions.map((submission) => {
          const shifts = parseShifts(submission.shifts);
          const submissionDate = format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he });
          
          return (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      שבוע {formatWeekRange(submission.week_start_date, submission.week_end_date)}
                    </span>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(submission.status)}
                      {getStatusLabel(submission.status)}
                    </div>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    הוגש: {submissionDate}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {shifts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">משמרות שהוגשו:</h4>
                    <div className="grid gap-2">
                      {shifts.map((shift: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.branch_name || 'לא צוין'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{shift.shift_time || shift.shift_type || 'לא צוין'}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {shift.day_name || format(new Date(shift.date || new Date()), 'EEEE', { locale: he })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">הערות:</h4>
                    <p className="text-sm text-muted-foreground">{submission.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};