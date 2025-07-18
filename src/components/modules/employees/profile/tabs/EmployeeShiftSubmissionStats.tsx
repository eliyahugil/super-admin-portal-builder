import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, FileText, TrendingUp, BarChart3, Award, Users } from 'lucide-react';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

interface EmployeeShiftSubmissionStatsProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface ShiftSubmissionStat {
  id: string;
  week_start_date: string;
  week_end_date: string;
  shifts: any;
  notes?: string;
  status: string;
  submitted_at: string;
}

interface SubmissionStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  totalShiftsRequested: number;
  averageShiftsPerWeek: number;
  submissionRate: number; // percentage of weeks submitted
  lastSubmission?: Date;
  mostActiveWeek?: string;
}

export const EmployeeShiftSubmissionStats: React.FC<EmployeeShiftSubmissionStatsProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  // Get all shift submissions for this employee and their preferences
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['employee-submission-stats', employeeId],
    queryFn: async () => {
      if (!employeeId) return { submissions: [], preferences: [] };
      
      // Get submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select(`
          id,
          week_start_date,
          week_end_date,
          shifts,
          notes,
          status,
          submitted_at
        `)
        .eq('employee_id', employeeId)
        .order('week_start_date', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Get employee preferences and assignments
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('employee_branch_assignments')
        .select('shift_types, available_days, is_active')
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (preferencesError) throw preferencesError;

      console.log('📊 Submissions and preferences:', { 
        submissions: submissionsData?.length || 0,
        preferences: preferencesData 
      });
      
      return { 
        submissions: submissionsData || [], 
        preferences: preferencesData || [] 
      };
    },
    enabled: !!employeeId,
  });

  // Helper function to determine shift type from times
  const getShiftType = (startTime: string, endTime: string): string => {
    const start = parseInt(startTime.split(':')[0]);
    
    if (start >= 6 && start < 14) return 'morning';
    if (start >= 14 && start < 22) return 'evening';
    return 'night';
  };

  // Helper function to check if times overlap or are the same shift
  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = new Date(`2000-01-01T${start1}`);
    const e1 = new Date(`2000-01-01T${end1}`);
    const s2 = new Date(`2000-01-01T${start2}`);
    const e2 = new Date(`2000-01-01T${end2}`);
    
    return s1 < e2 && s2 < e1;
  };

  // Helper function to check if shift is valid for employee
  const isValidShiftForEmployee = (shift: any, allowedShiftTypes: string[], allowedDays: number[]): boolean => {
    if (!shift.date || !shift.start_time || !shift.end_time) return false;
    
    // Check shift type
    const shiftType = getShiftType(shift.start_time, shift.end_time);
    if (!allowedShiftTypes.includes(shiftType)) {
      console.log(`❌ Shift type ${shiftType} not allowed for employee. Allowed: ${allowedShiftTypes.join(', ')}`);
      return false;
    }
    
    // Check day of week
    const dayOfWeek = new Date(shift.date).getDay();
    if (!allowedDays.includes(dayOfWeek)) {
      console.log(`❌ Day ${dayOfWeek} not allowed for employee. Allowed: ${allowedDays.join(', ')}`);
      return false;
    }
    
    return true;
  };

  // Calculate statistics based on real submission data and employee preferences
  const calculateStats = (submissionsData: ShiftSubmissionStat[], preferencesData: any[]): SubmissionStats => {
    if (!submissionsData || submissionsData.length === 0) {
      return {
        totalSubmissions: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        rejectedSubmissions: 0,
        totalShiftsRequested: 0,
        averageShiftsPerWeek: 0,
        submissionRate: 0,
      };
    }

    // Get employee's allowed shift types and days
    const allowedShiftTypes: string[] = [];
    const allowedDays: number[] = [];
    
    preferencesData.forEach(pref => {
      if (pref.shift_types && Array.isArray(pref.shift_types)) {
        pref.shift_types.forEach((type: string) => {
          if (!allowedShiftTypes.includes(type)) {
            allowedShiftTypes.push(type);
          }
        });
      }
      if (pref.available_days && Array.isArray(pref.available_days)) {
        pref.available_days.forEach((day: number) => {
          if (!allowedDays.includes(day)) {
            allowedDays.push(day);
          }
        });
      }
    });

    console.log('👤 Employee preferences:', { allowedShiftTypes, allowedDays });

    const approved = submissionsData.filter(s => s.status === 'approved').length;
    const pending = submissionsData.filter(s => s.status === 'pending').length;
    const rejected = submissionsData.filter(s => s.status === 'rejected').length;
    
    // Calculate total valid unique shifts requested - group by date and overlapping times
    const totalShifts = submissionsData.reduce((acc, submission) => {
      if (!submission.shifts || !Array.isArray(submission.shifts)) return acc;
      
      // Group shifts by date first
      const shiftsByDate = new Map<string, any[]>();
      
      submission.shifts.forEach((shift: any) => {
        if (shift.date && shift.start_time && shift.end_time) {
          // Check if this shift is valid for the employee
          if (isValidShiftForEmployee(shift, allowedShiftTypes, allowedDays)) {
            if (!shiftsByDate.has(shift.date)) {
              shiftsByDate.set(shift.date, []);
            }
            shiftsByDate.get(shift.date)!.push(shift);
          }
        }
      });
      
      // For each date, count overlapping shifts as one
      let dateShiftCount = 0;
      shiftsByDate.forEach((shifts) => {
        const uniqueShifts: any[] = [];
        
        shifts.forEach((shift) => {
          // Check if this shift overlaps with any existing unique shift
          const overlapsWithExisting = uniqueShifts.some(existingShift => 
            timesOverlap(shift.start_time, shift.end_time, existingShift.start_time, existingShift.end_time)
          );
          
          if (!overlapsWithExisting) {
            uniqueShifts.push(shift);
          }
        });
        
        dateShiftCount += uniqueShifts.length;
      });
      
      return acc + dateShiftCount;
    }, 0);

    // Calculate weeks available for submission rate
    const weeksToCheck = submissionsData.length > 0 ? 12 : 0;
    const submissionRate = weeksToCheck > 0 ? Math.round((submissionsData.length / weeksToCheck) * 100) : 0;

    // Find most recent submission
    const lastSubmission = submissionsData.length > 0 
      ? new Date(submissionsData.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0].submitted_at)
      : undefined;

    // Find most active week (most valid unique shifts requested)
    let mostActiveWeek = '';
    let maxShifts = 0;
    
    submissionsData.forEach(submission => {
      if (!submission.shifts || !Array.isArray(submission.shifts)) return;
      
      // Count valid unique shifts in this submission with overlap handling
      const shiftsByDate = new Map<string, any[]>();
      
      submission.shifts.forEach((shift: any) => {
        if (shift.date && shift.start_time && shift.end_time) {
          if (isValidShiftForEmployee(shift, allowedShiftTypes, allowedDays)) {
            if (!shiftsByDate.has(shift.date)) {
              shiftsByDate.set(shift.date, []);
            }
            shiftsByDate.get(shift.date)!.push(shift);
          }
        }
      });
      
      let submissionShiftCount = 0;
      shiftsByDate.forEach((shifts) => {
        const uniqueShifts: any[] = [];
        
        shifts.forEach((shift) => {
          const overlapsWithExisting = uniqueShifts.some(existingShift => 
            timesOverlap(shift.start_time, shift.end_time, existingShift.start_time, existingShift.end_time)
          );
          
          if (!overlapsWithExisting) {
            uniqueShifts.push(shift);
          }
        });
        
        submissionShiftCount += uniqueShifts.length;
      });
      
      if (submissionShiftCount > maxShifts) {
        maxShifts = submissionShiftCount;
        mostActiveWeek = `${format(new Date(submission.week_start_date), 'dd/MM', { locale: he })} - ${format(new Date(submission.week_end_date), 'dd/MM', { locale: he })}`;
      }
    });

    console.log('📊 Final stats:', {
      totalSubmissions: submissionsData.length,
      totalValidShifts: totalShifts,
      averageValidShiftsPerWeek: submissionsData.length > 0 ? Math.round((totalShifts / submissionsData.length) * 10) / 10 : 0
    });

    return {
      totalSubmissions: submissionsData.length,
      approvedSubmissions: approved,
      pendingSubmissions: pending,
      rejectedSubmissions: rejected,
      totalShiftsRequested: totalShifts,
      averageShiftsPerWeek: submissionsData.length > 0 ? Math.round((totalShifts / submissionsData.length) * 10) / 10 : 0,
      submissionRate: Math.min(submissionRate, 100),
      lastSubmission,
      mostActiveWeek: mostActiveWeek || 'לא נמצא',
    };
  };

  const stats = submissions ? calculateStats(submissions.submissions, submissions.preferences) : null;

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">אין נתונים סטטיסטיים</h3>
            <p className="text-muted-foreground">לא נמצאו הגשות משמרות עבור עובד זה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">סה"כ הגשות</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">מאושרות</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">ממוצע משמרות</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageShiftsPerWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">שיעור הגשה</p>
                <p className="text-2xl font-bold text-purple-600">{stats.submissionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              פירוט סטטוס הגשות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">מאושרות</span>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">{stats.approvedSubmissions}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({stats.totalSubmissions > 0 ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">בהמתנה</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.pendingSubmissions}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({stats.totalSubmissions > 0 ? Math.round((stats.pendingSubmissions / stats.totalSubmissions) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">נדחו</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{stats.rejectedSubmissions}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({stats.totalSubmissions > 0 ? Math.round((stats.rejectedSubmissions / stats.totalSubmissions) * 100) : 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              מידע נוסף
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">סה"כ משמרות מבוקשות</span>
              <Badge variant="outline">{stats.totalShiftsRequested}</Badge>
            </div>
            
            {stats.lastSubmission && (
              <div className="flex items-center justify-between">
                <span className="text-sm">הגשה אחרונה</span>
                <span className="text-sm text-muted-foreground">
                  {format(stats.lastSubmission, 'dd/MM/yyyy', { locale: he })}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm">שבוע הכי פעיל</span>
              <span className="text-sm text-muted-foreground">{stats.mostActiveWeek}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            הגשות אחרונות
          </CardTitle>
          <CardDescription>5 ההגשות האחרונות של {employeeName}</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions && submissions.submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.submissions.slice(0, 5).map((submission) => {
                // Count valid shifts for this employee - handle overlapping shifts
                const validShiftsCount = (() => {
                  if (!submission.shifts || !Array.isArray(submission.shifts)) return 0;
                  
                  // Get employee's allowed shift types and days
                  const allowedShiftTypes: string[] = [];
                  const allowedDays: number[] = [];
                  
                  submissions.preferences.forEach(pref => {
                    if (pref.shift_types && Array.isArray(pref.shift_types)) {
                      pref.shift_types.forEach((type: string) => {
                        if (!allowedShiftTypes.includes(type)) allowedShiftTypes.push(type);
                      });
                    }
                    if (pref.available_days && Array.isArray(pref.available_days)) {
                      pref.available_days.forEach((day: number) => {
                        if (!allowedDays.includes(day)) allowedDays.push(day);
                      });
                    }
                  });
                  
                  // Group by date and handle overlapping shifts
                  const shiftsByDate = new Map<string, any[]>();
                  
                  submission.shifts.forEach((shift: any) => {
                    if (shift.date && shift.start_time && shift.end_time) {
                      if (isValidShiftForEmployee(shift, allowedShiftTypes, allowedDays)) {
                        if (!shiftsByDate.has(shift.date)) {
                          shiftsByDate.set(shift.date, []);
                        }
                        shiftsByDate.get(shift.date)!.push(shift);
                      }
                    }
                  });
                  
                  let totalUniqueShifts = 0;
                  shiftsByDate.forEach((shifts) => {
                    const uniqueShifts: any[] = [];
                    
                    shifts.forEach((shift) => {
                      const overlapsWithExisting = uniqueShifts.some(existingShift => 
                        timesOverlap(shift.start_time, shift.end_time, existingShift.start_time, existingShift.end_time)
                      );
                      
                      if (!overlapsWithExisting) {
                        uniqueShifts.push(shift);
                      }
                    });
                    
                    totalUniqueShifts += uniqueShifts.length;
                  });
                  
                  return totalUniqueShifts;
                })();

                return (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        שבוע {format(new Date(submission.week_start_date), 'dd/MM', { locale: he })} - {format(new Date(submission.week_end_date), 'dd/MM', { locale: he })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        הוגש: {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {validShiftsCount} משמרות תקינות
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">אין הגשות להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};