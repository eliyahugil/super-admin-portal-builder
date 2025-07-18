import React, { useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, MapPin, FileText, Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ShiftSubmission {
  id: string;
  employee_id: string;
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
  optional_morning_availability: number[];
  submitted_at: string;
  status: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

interface ShiftSubmissionsPopoverProps {
  children: React.ReactNode;
  submissions: ShiftSubmission[];
  targetDate: Date;
  shiftId?: string;
}

export const ShiftSubmissionsPopover: React.FC<ShiftSubmissionsPopoverProps> = ({
  children,
  submissions,
  targetDate,
  shiftId
}) => {
  // Filter submissions for the specific date
  const relevantSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Check if any shift in the submission matches the target date
      return submission.shifts.some(shift => {
        try {
          const shiftDate = parseISO(shift.date);
          return isSameDay(shiftDate, targetDate);
        } catch {
          return false;
        }
      });
    });
  }, [submissions, targetDate]);

  // Get shifts for the specific date
  const shiftsForDate = useMemo(() => {
    const shifts: Array<{
      submission: ShiftSubmission;
      shift: ShiftSubmission['shifts'][0];
    }> = [];

    relevantSubmissions.forEach(submission => {
      submission.shifts.forEach(shift => {
        try {
          const shiftDate = parseISO(shift.date);
          if (isSameDay(shiftDate, targetDate)) {
            // If shiftId is provided, only include shifts that match or don't have an ID
            if (!shiftId || shift.available_shift_id === shiftId || !shift.available_shift_id) {
              shifts.push({ submission, shift });
            }
          }
        } catch {
          // Skip invalid dates
        }
      });
    });

    return shifts;
  }, [relevantSubmissions, targetDate, shiftId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          הוגש
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
          אושר
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">
          נדחה
        </Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: he });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  if (shiftsForDate.length === 0) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="center" side="top">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              הגשות ליום {formatDate(targetDate.toISOString())}
            </CardTitle>
            <CardDescription className="text-xs">
              {shiftsForDate.length} הגשות נמצאו
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {shiftsForDate.map(({ submission, shift }, index) => (
              <div 
                key={`${submission.id}-${index}`}
                className="border rounded-lg p-3 bg-gray-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {submission.employee ? 
                        `${submission.employee.first_name} ${submission.employee.last_name}` : 
                        'עובד לא ידוע'
                      }
                    </span>
                    {submission.employee?.employee_id && (
                      <span className="text-xs text-muted-foreground">
                        ({submission.employee.employee_id})
                      </span>
                    )}
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                  </div>
                  
                  {shift.branch_preference && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{shift.branch_preference}</span>
                    </div>
                  )}
                </div>

                {shift.role_preference && (
                  <div className="text-xs text-muted-foreground">
                    👔 {shift.role_preference}
                  </div>
                )}

                {shift.notes && (
                  <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                    <FileText className="h-3 w-3 inline mr-1" />
                    {shift.notes}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  הוגש: {format(parseISO(submission.submitted_at), 'dd/MM HH:mm', { locale: he })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};