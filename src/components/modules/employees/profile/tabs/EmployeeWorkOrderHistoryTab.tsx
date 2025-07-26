import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

interface EmployeeWorkOrderHistoryTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface ScheduledShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  role: string | null;
  branch: {
    id: string;
    name: string;
    address: string;
  } | null;
}

export const EmployeeWorkOrderHistoryTab: React.FC<EmployeeWorkOrderHistoryTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { data: scheduledShifts, isLoading } = useQuery({
    queryKey: ['employee-work-order-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select(`
          id,
          shift_date,
          start_time,
          end_time,
          status,
          notes,
          created_at,
          updated_at,
          role,
          branch:branches(id, name, address)
        `)
        .eq('employee_id', employeeId)
        .order('shift_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ScheduledShift[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'cancelled': return 'בוטל';
      case 'completed': return 'הושלם';
      default: return status || 'לא צוין';
    }
  };


  const formatTime = (time: string) => {
    try {
      return format(new Date(`2000-01-01T${time}`), 'HH:mm');
    } catch {
      return time;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!scheduledShifts || scheduledShifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            היסטוריית הזמנות עבודה
          </CardTitle>
          <CardDescription>
            כל המשמרות שהוקצו ל{employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            לא נמצאו משמרות מתוכננות עבור עובד זה
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group shifts by month for better organization
  const groupedShifts = scheduledShifts.reduce((acc, shift) => {
    const monthKey = format(new Date(shift.shift_date), 'yyyy-MM', { locale: he });
    const monthLabel = format(new Date(shift.shift_date), 'MMMM yyyy', { locale: he });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, shifts: [] };
    }
    acc[monthKey].shifts.push(shift);
    
    return acc;
  }, {} as Record<string, { label: string; shifts: ScheduledShift[] }>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            היסטוריית הזמנות עבודה
          </CardTitle>
          <CardDescription>
            סה"כ {scheduledShifts.length} משמרות מתוכננות עבור {employeeName}
          </CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(groupedShifts).map(([monthKey, { label, shifts }]) => (
        <Card key={monthKey}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{label}</CardTitle>
            <CardDescription>{shifts.length} משמרות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {shifts.map((shift) => {
                const shiftDate = format(new Date(shift.shift_date), 'EEEE, dd/MM/yyyy', { locale: he });
                const createdDate = format(new Date(shift.created_at), 'dd/MM/yyyy HH:mm', { locale: he });
                
                return (
                  <div key={shift.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{shiftDate}</span>
                        <Badge className={getStatusColor(shift.status)}>
                          {getStatusLabel(shift.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </div>
                        {shift.branch && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shift.branch.name}
                          </div>
                        )}
                        {shift.role && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {shift.role}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        נוצר: {createdDate}
                      </div>
                      
                      {shift.notes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium">הערות: </span>
                          {shift.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};