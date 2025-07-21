import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Eye, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface Branch {
  id: string;
  name: string;
  address?: string;
}

interface ScheduledShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  employee_id?: string;
  branch_id: string;
  employee?: Employee;
  employees?: Employee; // Support both singular and plural from Supabase
  branch?: Branch;
  branches?: Branch;   // Support both singular and plural from Supabase
}

interface EmployeeScheduleViewProps {
  employee: Employee;
}

export const EmployeeScheduleView: React.FC<EmployeeScheduleViewProps> = ({ employee }) => {
  const [shifts, setShifts] = useState<ScheduledShift[]>([]);
  const [allShifts, setAllShifts] = useState<ScheduledShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [employeeBranches, setEmployeeBranches] = useState<Branch[]>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  // Fetch employee's branch assignments
  const fetchEmployeeBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_branch_assignments')
        .select(`
          branch_id,
          branches!inner(id, name, address)
        `)
        .eq('employee_id', employee.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const branches = data?.map(item => item.branches).filter(Boolean) || [];
      setEmployeeBranches(branches);
    } catch (error) {
      console.error('Error fetching employee branches:', error);
    }
  };

  // Fetch shifts for the week
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const branchIds = employeeBranches.map(b => b.id);
      
      if (branchIds.length === 0) {
        setShifts([]);
        setAllShifts([]);
        return;
      }

      // Fetch employee's own shifts
      const { data: employeeShifts, error: employeeError } = await supabase
        .from('scheduled_shifts')
        .select(`
          *,
          branches!inner(id, name, address),
          employees!inner(id, first_name, last_name, phone)
        `)
        .eq('employee_id', employee.id)
        .in('branch_id', branchIds)
        .gte('shift_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('shift_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('shift_date')
        .order('start_time');

      if (employeeError) throw employeeError;

      // Fetch all shifts in employee's branches for "all shifts" view
      const { data: branchShifts, error: branchError } = await supabase
        .from('scheduled_shifts')
        .select(`
          *,
          branches!inner(id, name, address),
          employees(id, first_name, last_name, phone)
        `)
        .in('branch_id', branchIds)
        .gte('shift_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('shift_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('shift_date')
        .order('start_time');

      if (branchError) {
        console.error('Error fetching branch shifts:', branchError);
        throw branchError;
      }

      console.log('✅ Fetched data successfully:', {
        employeeShifts: employeeShifts?.length || 0,
        branchShifts: branchShifts?.length || 0,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd')
      });

      setShifts(employeeShifts || []);
      setAllShifts(branchShifts || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeBranches();
  }, [employee.id]);

  useEffect(() => {
    if (employeeBranches.length > 0) {
      fetchShifts();
    }
  }, [currentWeek, employeeBranches]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'מאושר';
      case 'pending': return 'בהמתנה';
      case 'cancelled': return 'מבוטל';
      default: return 'לא מוקצה';
    }
  };

  const renderDayShifts = (date: Date, shiftsData: ScheduledShift[], showEmployeeName = false) => {
    const dayShifts = shiftsData.filter(shift => 
      isSameDay(new Date(shift.shift_date), date)
    ).sort((a, b) => {
      // Parse time function
      const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
        return hours * 60 + minutes;
      };

      const startA = parseTime(a.start_time);
      const startB = parseTime(b.start_time);
      
      if (startA !== startB) {
        return startA - startB; // Earlier shifts first
      }
      
      // If start times are equal, longer shifts first
      const endA = parseTime(a.end_time);
      const endB = parseTime(b.end_time);
      const durationA = endA - startA;
      const durationB = endB - startB;
      
      return durationB - durationA; // Longer shifts first
    });

    if (dayShifts.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground text-sm">
          אין משמרות
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {dayShifts.map((shift) => (
          <Card key={shift.id} className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {shift.start_time} - {shift.end_time}
                  </span>
                </div>
                <Badge className={getStatusColor(shift.status)}>
                  {getStatusText(shift.status)}
                </Badge>
              </div>
              
              {/* Employee info - always show when available */}
              {(shift.employees || shift.employee) && (
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="font-medium text-blue-800 text-sm">
                    {shift.employees?.first_name || shift.employee?.first_name} {shift.employees?.last_name || shift.employee?.last_name}
                  </span>
                </div>
              )}
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{shift.branches?.name || shift.branch?.name}</span>
                </div>
                
                {shift.notes && (
                  <div className="text-xs mt-2 p-2 bg-muted rounded">
                    {shift.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)); // ראשון עד שבת בסדר נכון

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">טוען סידור...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              סידור שבועי
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                שבוע קודם
              </Button>
              <span className="font-medium px-4">
                {format(weekStart, 'dd/MM', { locale: he })} - {format(weekEnd, 'dd/MM/yyyy', { locale: he })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                שבוע הבא
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Branches Info */}
      {employeeBranches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              הסניפים שלי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {employeeBranches.map((branch) => (
                <Badge key={branch.id} variant="secondary">
                  {branch.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Views */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            התצוגה שלי
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            תצוגה כוללת
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4" dir="rtl">
            {weekDays.map((day, index) => (
              <Card key={index} className="min-h-[200px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">
                    {format(day, 'EEEE', { locale: he })}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {format(day, 'dd/MM', { locale: he })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {renderDayShifts(day, shifts)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4" dir="rtl">
            {weekDays.map((day, index) => (
              <Card key={index} className="min-h-[200px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">
                    {format(day, 'EEEE', { locale: he })}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {format(day, 'dd/MM', { locale: he })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {renderDayShifts(day, allShifts, true)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};