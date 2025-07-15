import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { ShiftScheduleData, Employee } from './types';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  assignedShifts: number;
  requiredShifts: number;
  totalHours: number;
  status: 'over' | 'under' | 'exact';
  shifts: ShiftScheduleData[];
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
  const calculateEmployeeStats = (): EmployeeStats[] => {
    const stats: EmployeeStats[] = [];
    
    employees.forEach(employee => {
      const employeeShifts = shifts.filter(shift => 
        shift.employee_id === employee.id && 
        shift.status === 'approved' &&
        !shift.is_archived
      );
      
      const totalHours = employeeShifts.reduce((total, shift) => {
        const startTime = new Date(`2000-01-01T${shift.start_time}`);
        const endTime = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      const requiredShifts = employee.weekly_hours_required || 0;
      const assignedShifts = employeeShifts.length;
      
      let status: 'over' | 'under' | 'exact' = 'exact';
      if (assignedShifts > requiredShifts) status = 'over';
      else if (assignedShifts < requiredShifts) status = 'under';
      
      stats.push({
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        assignedShifts,
        requiredShifts,
        totalHours,
        status,
        shifts: employeeShifts
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
            <div key={stat.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{stat.employeeName}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <Clock className="h-3 w-3 inline ml-1" />
                  {stat.totalHours.toFixed(1)} שעות
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{stat.assignedShifts}</span>
                  <span className="text-gray-500"> / {stat.requiredShifts}</span>
                </div>
                
                <Badge className={getStatusColor(stat.status)} variant="outline">
                  {getStatusIcon(stat.status)}
                  <span className="mr-1">{getStatusText(stat.status)}</span>
                </Badge>
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