import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, FileText, Calendar, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

interface EmployeeShiftSubmissionsTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface ShiftSubmission {
  id: string;
  week_start_date: string;
  week_end_date: string;
  shifts: any;
  notes?: string;
  submission_type?: string;
  status: string;
  submitted_at: string;
  created_at: string;
  employees: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export const EmployeeShiftSubmissionsTab: React.FC<EmployeeShiftSubmissionsTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  // Get regular shift submissions and employee preferences
  const { data: submissionData, isLoading } = useQuery({
    queryKey: ['employee-regular-submissions', employeeId],
    queryFn: async () => {
      if (!employeeId) return { submissions: [], preferences: [] };
      
      // Get submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('employee_id', employeeId)
        .or('submission_type.eq.regular,submission_type.is.null')
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Get employee preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('employee_branch_assignments')
        .select('shift_types, available_days, is_active')
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (preferencesError) throw preferencesError;

      console.log('📊 Regular submissions for employee:', submissions?.length || 0);
      return { submissions: submissions || [], preferences: preferences || [] };
    },
    enabled: !!employeeId,
  });

  const submissions = submissionData?.submissions || [];
  const preferences = submissionData?.preferences || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'pending':
        return <Badge variant="secondary">בהמתנה</Badge>;
      case 'rejected':
        return <Badge variant="destructive">נדחה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to determine shift type from times
  const getShiftType = (startTime: string, endTime: string): string => {
    const start = parseInt(startTime.split(':')[0]);
    
    if (start >= 6 && start < 14) return 'morning';
    // All shifts from 14:00 onwards are 'evening'
    if (start >= 14) return 'evening';
    return 'night';
  };

  // Helper function to check if shift is valid for employee preferences
  const isValidShiftForEmployee = (shift: any): boolean => {
    if (!shift.date || !shift.start_time || !shift.end_time) return false;
    
    // Get employee's allowed shift types and days
    const allowedShiftTypes: string[] = [];
    const allowedDays: number[] = [];
    
    preferences.forEach(pref => {
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
    
    // Check shift type
    const shiftType = getShiftType(shift.start_time, shift.end_time);
    if (!allowedShiftTypes.includes(shiftType)) return false;
    
    // Check day of week
    const dayOfWeek = new Date(shift.date).getDay();
    if (!allowedDays.includes(dayOfWeek)) return false;
    
    return true;
  };

  // Helper function to check if times overlap
  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = new Date(`2000-01-01T${start1}`);
    const e1 = new Date(`2000-01-01T${end1}`);
    const s2 = new Date(`2000-01-01T${start2}`);
    const e2 = new Date(`2000-01-01T${end2}`);
    
    return s1 < e2 && s2 < e1;
  };

  // Function to separate shifts into regular and special
  const categorizeShifts = (shifts: any[]) => {
    if (!shifts || !Array.isArray(shifts)) return { regular: [], special: [] };
    
    const regular: any[] = [];
    const special: any[] = [];
    
    shifts.forEach(shift => {
      if (isValidShiftForEmployee(shift)) {
        regular.push(shift);
      } else {
        special.push(shift);
      }
    });
    
    console.log('📋 Categorized shifts:', { regular: regular.length, special: special.length, total: shifts.length });
    return { regular, special };
  };

  const formatShiftCount = (shifts: any[]) => {
    if (!shifts || shifts.length === 0) return '0 משמרות';
    
    // Group by date and handle overlapping shifts
    const shiftsByDate = new Map<string, any[]>();
    
    shifts.forEach((shift: any) => {
      if (shift.date && shift.start_time && shift.end_time) {
        if (!shiftsByDate.has(shift.date)) {
          shiftsByDate.set(shift.date, []);
        }
        shiftsByDate.get(shift.date)!.push(shift);
      }
    });
    
    let totalUniqueShifts = 0;
    shiftsByDate.forEach((dateShifts) => {
      const uniqueShifts: any[] = [];
      
      dateShifts.forEach((shift) => {
        const overlapsWithExisting = uniqueShifts.some(existingShift => 
          timesOverlap(shift.start_time, shift.end_time, existingShift.start_time, existingShift.end_time)
        );
        
        if (!overlapsWithExisting) {
          uniqueShifts.push(shift);
        }
      });
      
      totalUniqueShifts += uniqueShifts.length;
    });
    
    return `${totalUniqueShifts} משמרות`;
  };

  const toggleExpanded = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const renderShiftDetails = (shifts: any[], isSpecial: boolean = false) => {
    if (!shifts || shifts.length === 0) return null;
    
    // Group shifts by date first
    const shiftsByDate = new Map<string, any[]>();
    shifts.forEach((shift: any) => {
      if (shift.date && shift.start_time && shift.end_time) {
        if (!shiftsByDate.has(shift.date)) {
          shiftsByDate.set(shift.date, []);
        }
        shiftsByDate.get(shift.date)!.push(shift);
      }
    });

    // For each date, group overlapping shifts
    const finalShifts: any[] = [];
    shiftsByDate.forEach((dateShifts, date) => {
      const uniqueShifts: any[] = [];
      
      dateShifts.forEach((shift) => {
        // Find if this shift overlaps with any existing unique shift
        const existingShift = uniqueShifts.find(existing => 
          timesOverlap(shift.start_time, shift.end_time, existing.start_time, existing.end_time)
        );
        
        if (existingShift) {
          // Add branch to existing shift
          if (!existingShift.branches.includes(shift.branch_preference)) {
            existingShift.branches.push(shift.branch_preference);
          }
          // Merge role preferences and notes
          if (shift.role_preference && !existingShift.role_preferences.includes(shift.role_preference)) {
            existingShift.role_preferences.push(shift.role_preference);
          }
          if (shift.notes && !existingShift.notes_list.includes(shift.notes)) {
            existingShift.notes_list.push(shift.notes);
          }
        } else {
          // Create new unique shift
          uniqueShifts.push({
            ...shift,
            branches: [shift.branch_preference],
            role_preferences: shift.role_preference ? [shift.role_preference] : [],
            notes_list: shift.notes ? [shift.notes] : []
          });
        }
      });
      
      finalShifts.push(...uniqueShifts);
    });
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-foreground">
            {isSpecial ? 'משמרות מיוחדות:' : 'משמרות רגילות:'}
          </div>
          {isSpecial && <AlertTriangle className="h-4 w-4 text-orange-500" />}
        </div>
        <div className="grid gap-2">
          {finalShifts.map((shift, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-3 text-sm ${
                isSpecial 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {format(new Date(shift.date), 'EEEE dd/MM/yyyy', { locale: he })}
                </div>
                <div className="text-muted-foreground">
                  {shift.start_time} - {shift.end_time}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="mb-1">
                  <span className="font-medium">אופציות סניפים: </span>
                  {shift.branches.join(', ')}
                </div>
                {shift.role_preferences.length > 0 && (
                  <div className="mb-1">
                    <span className="font-medium">תפקידים מועדפים: </span>
                    {shift.role_preferences.join(', ')}
                  </div>
                )}
                {shift.notes_list.length > 0 && (
                  <div className="mb-1">
                    <span className="font-medium">הערות: </span>
                    {shift.notes_list.join(', ')}
                  </div>
                )}
                {isSpecial && (
                  <div className="text-orange-600 font-medium">
                    {(() => {
                      const shiftType = getShiftType(shift.start_time, shift.end_time);
                      const dayOfWeek = new Date(shift.date).getDay();
                      
                      // Get employee's allowed types
                      const allowedTypes: string[] = [];
                      preferences.forEach(pref => {
                        if (pref.shift_types) allowedTypes.push(...pref.shift_types);
                      });
                      
                      if (!allowedTypes.includes(shiftType)) {
                        return `מיוחד: עובד מוגדר ל-${allowedTypes.join('/')} אך ביקש ${shiftType === 'morning' ? 'בוקר' : shiftType === 'evening' ? 'ערב' : 'לילה'}`;
                      }
                      
                      return 'מיוחד: לא תואם להגדרות העובד';
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            הגשות רגילות
          </CardTitle>
          <CardDescription>הגשות משמרות רגילות (לא מיוחדות) של {employeeName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          הגשות רגילות
        </CardTitle>
        <CardDescription>
          הגשות משמרות רגילות (לא מיוחדות) של {employeeName} - סה"כ {submissions?.length || 0} הגשות
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submissions || submissions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">אין הגשות רגילות</h3>
            <p className="text-muted-foreground">לא נמצאו הגשות משמרות רגילות עבור עובד זה</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: ShiftSubmission) => {
              const submissionShifts = Array.isArray(submission.shifts) ? submission.shifts : [];
              const { regular: regularShifts, special: specialShifts } = categorizeShifts(submissionShifts);
              const isExpanded = expandedSubmissions.has(submission.id);
              
              console.log('📝 Processing submission:', {
                id: submission.id,
                totalShifts: submissionShifts.length,
                regular: regularShifts.length,
                special: specialShifts.length
              });
              
              return (
                <Card key={submission.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              שבוע {format(new Date(submission.week_start_date), 'dd/MM/yyyy', { locale: he })} - {format(new Date(submission.week_end_date), 'dd/MM/yyyy', { locale: he })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              הוגש ב-{format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                            </span>
                          </div>
                          
                          {/* Summary of shifts */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">סה"כ משמרות: </span>
                              <span>{submissionShifts.length}</span>
                            </div>
                            {regularShifts.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-green-600">רגילות: </span>
                                <span className="text-green-600">{formatShiftCount(regularShifts)}</span>
                              </div>
                            )}
                            {specialShifts.length > 0 && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-orange-600">מיוחדות: </span>
                                <span className="text-orange-600">{formatShiftCount(specialShifts)}</span>
                              </div>
                            )}
                          </div>
                          
                          {submission.notes && (
                            <div className="text-sm">
                              <span className="font-medium">הערות: </span>
                              <span className="text-muted-foreground">{submission.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(submission.status)}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            רגילה
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Toggle button */}
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(submission.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              הסתר פירוט
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              הצג פירוט
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Detailed view */}
                      {isExpanded && (
                        <div className="space-y-4">
                          {submissionShifts.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              אין משמרות בהגשה זו
                            </div>
                          ) : (
                            <>
                              {regularShifts.length > 0 && renderShiftDetails(regularShifts, false)}
                              {specialShifts.length > 0 && renderShiftDetails(specialShifts, true)}
                              {regularShifts.length === 0 && specialShifts.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                  לא ניתן לעבד את המשמרות בהגשה זו
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};