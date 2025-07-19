import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, FileText, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftScheduleData, Employee } from './types';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  assignedShifts: number;
  submittedShifts: number;  // הוספנו - כמות המשמרות שהגיש
  requiredShifts: number;
  totalHours: number;
  status: 'over' | 'under' | 'exact';
  shifts: ShiftScheduleData[];
  submissionSuccessRate: number; // אחוז הצלחה של הגשות
}

interface EmployeeStatsPanelProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  weekRange: { start: Date; end: Date };
  className?: string;
}

export const EmployeeStatsPanel: React.FC<EmployeeStatsPanelProps> = ({
  shifts,
  employees,
  weekRange,
  className = ''
}) => {
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);

  // שליפת נתוני הגשות משמרות
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('shift_submissions')
          .select(`
            *,
            employees!inner(
              id,
              first_name,
              last_name,
              business_id,
              is_active
            )
          `)
          .eq('employees.is_active', true)
          .gte('submitted_at', weekRange.start.toISOString())
          .lte('submitted_at', weekRange.end.toISOString());

        if (error) {
          console.error('Error fetching submissions:', error);
        } else {
          setSubmissionsData(data || []);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, [weekRange]);
  const calculateEmployeeStats = (): EmployeeStats[] => {
    const stats: EmployeeStats[] = [];
    
    // סינון רק עובדים פעילים
    const activeEmployees = employees.filter(employee => employee.is_active === true);
    
    activeEmployees.forEach(employee => {
      const employeeShifts = shifts.filter(shift => 
        shift.employee_id === employee.id && 
        shift.status === 'approved' &&
        !shift.is_archived
      );
      
      // חישוב נתוני הגשות עבור העובד
      const employeeSubmissions = submissionsData.filter(submission => 
        submission.employees?.id === employee.id
      );
      
      // חישוב אחוז הצלחה - כמה מהמשמרות שהגיש הוא קיבל
      const submittedShiftsCount = employeeSubmissions.length;
      const assignedShifts = employeeShifts.length;
      const submissionSuccessRate = submittedShiftsCount > 0 
        ? Math.round((assignedShifts / submittedShiftsCount) * 100) 
        : 0;
      
      const totalHours = employeeShifts.reduce((total, shift) => {
        const startTime = new Date(`2000-01-01T${shift.start_time}`);
        const endTime = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      const requiredShifts = employee.weekly_hours_required || 0;
      
      let status: 'over' | 'under' | 'exact' = 'exact';
      if (assignedShifts > requiredShifts) status = 'over';
      else if (assignedShifts < requiredShifts) status = 'under';
      
      stats.push({
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        assignedShifts,
        submittedShifts: submittedShiftsCount,
        requiredShifts,
        totalHours,
        status,
        shifts: employeeShifts,
        submissionSuccessRate
      });
    });
    
    return stats.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'he'));
  };

  const employeeStats = calculateEmployeeStats();
  const overWorkedEmployees = employeeStats.filter(stat => stat.status === 'over');
  const underWorkedEmployees = employeeStats.filter(stat => stat.status === 'under');
  const perfectEmployees = employeeStats.filter(stat => stat.status === 'exact');

  const getStatusIcon = (status: 'over' | 'under' | 'exact') => {
    switch (status) {
      case 'over': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'under': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'exact': return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: 'over' | 'under' | 'exact') => {
    switch (status) {
      case 'over': return 'bg-red-50 text-red-700 border-red-200';
      case 'under': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'exact': return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getStatusText = (status: 'over' | 'under' | 'exact') => {
    switch (status) {
      case 'over': return 'יותר מדי';
      case 'under': return 'פחות מדי';
      case 'exact': return 'מושלם';
    }
  };

  return (
    <Card className={className} dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          סטטיסטיקות עובדים
          <Badge variant="outline" className="mr-auto">
            {weekRange.start.toLocaleDateString('he-IL')} - {weekRange.end.toLocaleDateString('he-IL')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{overWorkedEmployees.length}</div>
            <div className="text-sm text-red-700">יותר מדי משמרות</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{underWorkedEmployees.length}</div>
            <div className="text-sm text-orange-700">פחות מדי משמרות</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{perfectEmployees.length}</div>
            <div className="text-sm text-green-700">מספר מושלם</div>
          </div>
        </div>

        {/* Alerts for problematic assignments */}
        {overWorkedEmployees.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {overWorkedEmployees.length} עובדים קיבלו יותר משמרות מהמוגדר
            </AlertDescription>
          </Alert>
        )}

        {underWorkedEmployees.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700">
              {underWorkedEmployees.length} עובדים קיבלו פחות משמרות מהמוגדר
            </AlertDescription>
          </Alert>
        )}

        {/* Employee List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {employeeStats.map((stat) => (
            <div key={stat.employeeId} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{stat.employeeName}</span>
                </div>
                
                <Badge className={getStatusColor(stat.status)} variant="outline">
                  {getStatusIcon(stat.status)}
                  <span className="mr-1">{getStatusText(stat.status)}</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {/* משמרות שקיבל */}
                <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                  <div className="font-medium text-green-700">{stat.assignedShifts}</div>
                  <div className="text-xs text-green-600">משמרות שקיבל</div>
                </div>
                
                {/* משמרות שהגיש */}
                <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="font-medium text-blue-700">{stat.submittedShifts}</div>
                  <div className="text-xs text-blue-600">משמרות שהגיש</div>
                </div>
                
                {/* אחוז הצלחה */}
                <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                  <div className="font-medium text-purple-700">{stat.submissionSuccessRate}%</div>
                  <div className="text-xs text-purple-600">אחוז הצלחה</div>
                </div>
                
                {/* שעות עבודה */}
                <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="font-medium text-orange-700">{stat.totalHours.toFixed(1)}</div>
                  <div className="text-xs text-orange-600">שעות עבודה</div>
                </div>
              </div>
              
              {/* קו נתונים נוסף */}
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                <span>נדרשות: {stat.requiredShifts} משמרות</span>
                {stat.submittedShifts > 0 && (
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    {stat.submittedShifts > stat.assignedShifts ? 
                      `עודף ${stat.submittedShifts - stat.assignedShifts} הגשות` : 
                      'כל ההגשות התקבלו'
                    }
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {employeeStats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>אין עובדים עם משמרות השבוע</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};