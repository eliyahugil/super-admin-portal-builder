import React, { useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, MapPin, FileText, Calendar, UserCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ShiftSubmission {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  branch_preference?: string;
  role_preference?: string;
  notes?: string;
  submitted_at: string;
  status?: string;
  employees: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    phone?: string;
  };
}

interface ShiftSubmissionsPopoverProps {
  children: React.ReactNode;
  submissions: ShiftSubmission[];
  targetDate: Date;
  shiftId?: string;
  onAssignEmployee?: (employeeId: string) => void;
}

export const ShiftSubmissionsPopover: React.FC<ShiftSubmissionsPopoverProps> = ({
  children,
  submissions,
  targetDate,
  shiftId,
  onAssignEmployee
}) => {
  // Filter submissions for the specific date
  const submissionsForDate = useMemo(() => {
    const targetDateStr = targetDate.toISOString().split('T')[0];
    return submissions.filter(submission => {
      return submission.shift_date === targetDateStr;
    });
  }, [submissions, targetDate]);

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

  if (submissionsForDate.length === 0) {
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
              הגשות ליום {formatDate(targetDate)}
            </CardTitle>
            <CardDescription className="text-xs">
              {submissionsForDate.length} עובדים הגישו בקשות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {submissionsForDate.map((submission) => (
              <div 
                key={submission.id}
                className="border rounded-lg p-3 bg-gray-50/50 space-y-2 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {submission.employees.first_name} {submission.employees.last_name}
                    </span>
                    {submission.employees.employee_id && (
                      <span className="text-xs text-muted-foreground">
                        ({submission.employees.employee_id})
                      </span>
                    )}
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatTime(submission.start_time)} - {formatTime(submission.end_time)}</span>
                  </div>
                  
                  {submission.branch_preference && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{submission.branch_preference}</span>
                    </div>
                  )}
                </div>

                {submission.role_preference && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">תפקיד מועדף:</span> {submission.role_preference}
                  </div>
                )}

                {submission.notes && (
                  <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                    <FileText className="h-3 w-3 inline mr-1" />
                    {submission.notes}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    הוגש: {format(parseISO(submission.submitted_at), 'dd/MM HH:mm', { locale: he })}
                  </div>
                  
                  {onAssignEmployee && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => onAssignEmployee(submission.employee_id)}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      שייך למשמרת
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};