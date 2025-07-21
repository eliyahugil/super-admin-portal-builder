import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Eye, User, ChevronDown, ChevronRight, Grid3X3, List } from 'lucide-react';
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
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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
      case 'approved':
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

    // Group shifts by branch
    const shiftsByBranch = dayShifts.reduce((acc, shift) => {
      const branchId = shift.branch_id || shift.branches?.id;
      const branchName = shift.branches?.name || shift.branch?.name || 'לא מוגדר';
      
      if (!acc[branchId]) {
        acc[branchId] = {
          branchName,
          shifts: []
        };
      }
      acc[branchId].shifts.push(shift);
      return acc;
    }, {} as Record<string, { branchName: string; shifts: ScheduledShift[] }>);

    return (
      <div className="space-y-3">
        {Object.entries(shiftsByBranch).map(([branchId, { branchName, shifts }]) => (
          <div key={branchId} className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground border-b border-muted pb-1">
              {branchName}
            </div>
            {shifts.map((shift) => (
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
                  
                  {shift.notes && (
                    <div className="text-xs mt-2 p-2 bg-muted rounded">
                      {shift.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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

  const toggleBranch = (branchId: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  };

  const renderBranchShifts = (branch: Branch, shiftsData: ScheduledShift[]) => {
    const branchShifts = shiftsData.filter(shift => 
      shift.branch_id === branch.id || shift.branches?.id === branch.id
    ).sort((a, b) => {
      // Sort by date, then by time
      const dateA = new Date(a.shift_date);
      const dateB = new Date(b.shift_date);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
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

    const isExpanded = expandedBranches.has(branch.id);

    return (
      <Card key={branch.id} className="mb-4">
        <CardHeader 
          className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleBranch(branch.id)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {branch.name}
              <Badge variant="outline" className="ml-2">
                {branchShifts.length} משמרות
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {branch.address && (
                <span className="text-sm text-muted-foreground">{branch.address}</span>
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {branchShifts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                אין משמרות בסניף זה השבוע
              </div>
            ) : (
              <div className="space-y-3">
                {branchShifts.map((shift) => (
                  <Card key={shift.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(shift.shift_date), 'EEEE dd/MM', { locale: he })}
                          </span>
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
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            {shift.employees?.first_name || shift.employee?.first_name} {shift.employees?.last_name || shift.employee?.last_name}
                          </span>
                        </div>
                      )}
                      
                      {shift.notes && (
                        <div className="text-sm mt-2 p-2 bg-muted rounded">
                          {shift.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
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
          <div className="mb-4 flex justify-end gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              לוח שנה
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              רשימה
            </Button>
          </div>

          {viewMode === 'calendar' ? (
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
          ) : (
            <div className="space-y-4" dir="rtl">
              {employeeBranches.map((branch) => renderBranchShifts(branch, shifts))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="mb-4 flex justify-end gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              לוח שנה
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              רשימה
            </Button>
          </div>

          {viewMode === 'calendar' ? (
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
          ) : (
            <div className="space-y-4" dir="rtl">
              {employeeBranches.map((branch) => renderBranchShifts(branch, allShifts))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};