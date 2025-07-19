import React, { useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, MapPin, FileText, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ShiftSubmission {
  id: string;
  employee_id?: string;
  week_start_date: string;
  week_end_date: string;
  shifts: Array<{
    date: string;
    start_time: string;
    end_time: string;
    branch_preference: string;
    role_preference?: string;
    notes?: string;
    available_shift_id?: string;
  }>;
  notes?: string;
  submitted_at: string;
  status: string;
  employees: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

interface ShiftSubmissionsPopoverProps {
  children: React.ReactNode;
  submissions: ShiftSubmission[];
  targetDate: Date;
  shifts: any[]; // All shifts to check for conflicts
  currentShift: any; // The shift we're showing submissions for
  onAssignEmployee?: (employeeId: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ShiftSubmissionsPopover: React.FC<ShiftSubmissionsPopoverProps> = ({
  children,
  submissions,
  targetDate,
  shifts,
  currentShift,
  onAssignEmployee,
  isOpen,
  onOpenChange
}) => {
  // Filter submissions for the specific date, branch and shift times
  const relevantShifts = useMemo(() => {
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const results: Array<{
      submission: ShiftSubmission;
      shift: ShiftSubmission['shifts'][0];
      hasConflict: boolean;
      isAssigned: boolean;
    }> = [];

    submissions.forEach(submission => {
      // Parse shifts if they're stored as JSON string
      let submissionShifts;
      try {
        submissionShifts = typeof submission.shifts === 'string' 
          ? JSON.parse(submission.shifts) 
          : submission.shifts || [];
      } catch {
        submissionShifts = [];
      }

      submissionShifts.forEach((shift: any) => {
        // Check if this shift matches our target date and has overlapping time window in the same branch
        if (shift.date === targetDateStr && currentShift) {
          // Check if the shift is in the same branch (compare branch name or find matching branch)
          const isSameBranch = shift.branch_preference === currentShift.branch_name ||
            (currentShift.branch_id && shifts.find(s => s.branch_id === currentShift.branch_id)?.branch_name === shift.branch_preference);
          
          // Check if the submitted shift time overlaps with or is contained within the current shift time
          const submissionStart = shift.start_time;
          const submissionEnd = shift.end_time;
          const currentStart = currentShift.start_time;
          const currentEnd = currentShift.end_time;
          
          // Time overlap logic: check if submission time window overlaps with current shift
          const hasTimeOverlap = (submissionStart <= currentEnd && submissionEnd >= currentStart);
          
          if (isSameBranch && hasTimeOverlap) {
            // Check if employee has conflict with other scheduled shifts
          const hasConflict = shifts.some(scheduledShift => {
            const shiftDate = scheduledShift.shift_date;
            return shiftDate === targetDateStr &&
                   scheduledShift.employee_id === submission.employees.id &&
                   scheduledShift.id !== currentShift.id &&
                   (
                     (scheduledShift.start_time <= shift.start_time && scheduledShift.end_time > shift.start_time) ||
                     (scheduledShift.start_time < shift.end_time && scheduledShift.end_time >= shift.end_time) ||
                     (scheduledShift.start_time >= shift.start_time && scheduledShift.end_time <= shift.end_time)
                   );
          });

          // Check if employee is already assigned to this shift
          const isAssigned = currentShift.employee_id === submission.employees.id;

            results.push({ submission, shift, hasConflict, isAssigned });
          }
        }
      });
    });

    return results;
  }, [submissions, targetDate, shifts, currentShift]);

  // Count only non-conflicted submissions
  const availableSubmissions = relevantShifts.filter(item => !item.hasConflict);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
          אושר
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">
          נדחה
        </Badge>;
      case 'pending':
      case 'submitted':
      default:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          ממתין
        </Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: he });
  };

  // Always show the popover, even if no relevant shifts exist
  const hasRelevantSubmissions = relevantShifts.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="center" side="top">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              הגשות למשמרת {currentShift?.branch_name ? `ב${currentShift.branch_name}` : ''}
            </CardTitle>
            <CardDescription className="text-xs">
              {currentShift?.start_time && currentShift?.end_time ? 
                `${formatTime(currentShift.start_time)}-${formatTime(currentShift.end_time)} • ` : ''
              }{formatDate(targetDate)}
              <br />
              {availableSubmissions.length} זמינים מתוך {relevantShifts.length} הגשות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {!hasRelevantSubmissions ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">אין הגשות זמינות למשמרת זו</p>
                <p className="text-xs mt-1">הגשות יוצגו כאן אם יהיו זמינות</p>
              </div>
            ) : (
              relevantShifts.map(({ submission, shift, hasConflict, isAssigned }, index) => (
              <div 
                key={`${submission.id}-${index}`}
                className={`border rounded-lg p-3 space-y-2 transition-colors ${
                  hasConflict 
                    ? 'bg-red-50/50 border-red-200 opacity-60' 
                    : isAssigned
                      ? 'bg-green-50/50 border-green-200'
                      : 'bg-gray-50/50 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className={`h-4 w-4 ${hasConflict ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className={`font-medium text-sm ${hasConflict ? 'line-through' : ''}`}>
                      {submission.employees.first_name} {submission.employees.last_name}
                    </span>
                    {submission.employees.employee_id && (
                      <span className="text-xs text-muted-foreground">
                        ({submission.employees.employee_id})
                      </span>
                    )}
                    {hasConflict && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    {isAssigned && (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        מוקצה
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{shift.branch_preference}</span>
                  </div>
                </div>

                {shift.role_preference && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">תפקיד מועדף:</span> {shift.role_preference}
                  </div>
                )}

                {shift.notes && (
                  <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                    <FileText className="h-3 w-3 inline mr-1" />
                    {shift.notes}
                  </div>
                )}

                {hasConflict && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    ⚠️ העובד כבר מוקצה למשמרת אחרת באותן השעות
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    הוגש: {format(parseISO(submission.submitted_at), 'dd/MM HH:mm', { locale: he })}
                  </div>
                  
                  {onAssignEmployee && !hasConflict && !isAssigned && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => onAssignEmployee(submission.employees.id)}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      שייך למשמרת
                    </Button>
                  )}
                  
                  {isAssigned && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-green-50"
                      disabled
                    >
                      ✓ מוקצה
                    </Button>
                  )}
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};