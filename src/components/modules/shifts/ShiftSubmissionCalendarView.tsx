import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Clock,
  MapPin
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface ShiftSubmission {
  id: string;
  employee_id: string;
  employee_name: string;
  shifts: Array<{
    date: string;
    start_time: string;
    end_time: string;
    branch_preference: string;
    role_preference?: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export const ShiftSubmissionCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const businessId = useBusinessId();
  
  console.log('📅 ShiftSubmissionCalendarView: Current business ID:', businessId);

  // שליפת הגשות משמרות לחודש הנוכחי
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['calendar-submissions', businessId, format(currentDate, 'yyyy-MM')],
    queryFn: async (): Promise<ShiftSubmission[]> => {
      if (!businessId) return [];

      console.log('🔒 שולף הגשות משמרות עבור עסק:', businessId);
      
      // שולף את כל ההגשות של העסק ללא הגבלת תאריך
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employee:employees!inner(first_name, last_name, business_id)
        `)
        .eq('employee.business_id', businessId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('שגיאה בשליפת הגשות:', error);
        throw error;
      }

      console.log('📊 נתוני הגשות גולמיים:', data?.length || 0);

      const processedSubmissions = (data || []).map(submission => {
        const shifts = typeof submission.shifts === 'string' 
          ? JSON.parse(submission.shifts) 
          : submission.shifts || [];
          
        console.log('🔄 עיבוד הגשה:', {
          submissionId: submission.id,
          employeeName: submission.employee 
            ? `${submission.employee.first_name} ${submission.employee.last_name}` 
            : 'לא ידוע',
          shiftsCount: shifts.length,
          status: submission.status
        });

        return {
          id: submission.id,
          employee_id: submission.employee_id,
          employee_name: submission.employee 
            ? `${submission.employee.first_name} ${submission.employee.last_name}` 
            : 'לא ידוע',
          shifts: shifts,
          status: submission.status as 'pending' | 'approved' | 'rejected',
          submitted_at: submission.submitted_at
        };
      });

      console.log('✅ הגשות מעובדות:', processedSubmissions.length);
      
      return processedSubmissions;
    },
    enabled: !!businessId,
    refetchInterval: 30000, // רענון אוטומטי כל 30 שניות
    refetchOnWindowFocus: true, // רענון כאשר החלון מקבל פוקוס
    refetchOnMount: true // רענון עם טעינת הרכיב
  });

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // Get submissions for a specific date
  const getSubmissionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const result: Array<{submission: ShiftSubmission, shift: any}> = [];
    
    submissions.forEach(submission => {
      submission.shifts.forEach(shift => {
        if (shift.date === dateStr) {
          result.push({ submission, shift });
        }
      });
    });
    
    return result;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            לוח שנה - הגשות משמרות
          </h2>
          <p className="text-gray-600">צפייה בהגשות משמרות לפי תאריכים</p>
        </div>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b">
            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 border-l border-gray-200">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const daySubmissions = getSubmissionsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={index} 
                  className={`min-h-24 p-2 border-l border-b border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {daySubmissions.slice(0, 3).map(({ submission, shift }, idx) => (
                      <div 
                        key={`${submission.id}-${idx}`}
                        className={`text-xs p-1 rounded border ${getStatusColor(submission.status)}`}
                        title={`${submission.employee_name} - ${shift.start_time}-${shift.end_time} - ${shift.branch_preference}`}
                      >
                        <div className="font-medium truncate">
                          {submission.employee_name}
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <Clock className="h-2 w-2" />
                          {shift.start_time.substring(0, 5)}-{shift.end_time.substring(0, 5)}
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <MapPin className="h-2 w-2" />
                          {shift.branch_preference.length > 8 
                            ? `${shift.branch_preference.substring(0, 8)}...` 
                            : shift.branch_preference}
                        </div>
                      </div>
                    ))}
                    
                    {daySubmissions.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{daySubmissions.length - 3} נוספות
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה״כ הגשות השבוע</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ממתינות לאישור</p>
                <p className="text-2xl font-bold">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">משמרות מאושרות</p>
                <p className="text-2xl font-bold">
                  {submissions.reduce((total, submission) => 
                    total + (submission.status === 'approved' ? submission.shifts.length : 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};