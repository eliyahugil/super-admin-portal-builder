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
  submittedShifts: number;  // כמות ההגשות שהעובד הגיש
  requestedShifts: number;  // כמות המשמרות שביקש בהגשות
  totalHours: number;
  status: 'over' | 'under' | 'exact';
  shifts: ShiftScheduleData[];
  submissionSuccessRate: number; // אחוז הצלחה של הגשות
}

interface EmployeeStatsPanelProps {
  shifts: ShiftScheduleData[];
  employees: Employee[];
  weekRange: { start: Date; end: Date };
  businessId: string;
  branches?: any[]; // הוספתי נתוני סניפים
  className?: string;
}

export const EmployeeStatsPanel: React.FC<EmployeeStatsPanelProps> = ({
  shifts,
  employees,
  weekRange,
  businessId,
  branches = [],
  className = ''
}) => {
  console.log('📊 EmployeeStatsPanel - Props received:', {
    shiftsCount: shifts.length,
    employeesCount: employees.length,
    weekRange,
    businessId
  });

  const [submissionsData, setSubmissionsData] = useState<any[]>([]);

  // שליפת נתוני הגשות משמרות
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        console.log('📊 Fetching submissions for businessId:', businessId, 'weekRange:', weekRange);

        const { data: submissionsData, error } = await supabase
          .from('shift_submissions')
          .select('*')
          .gte('week_start_date', weekRange.start.toISOString().split('T')[0])
          .lte('week_end_date', weekRange.end.toISOString().split('T')[0]);

        if (error) {
          console.error('❌ Error fetching submissions:', error);
          setSubmissionsData([]);
        } else {
          console.log('✅ Found submissions data:', submissionsData);
          setSubmissionsData(submissionsData || []);
        }
      } catch (error) {
        console.error('❌ Error in fetchSubmissions:', error);
        setSubmissionsData([]);
      }
    };

    if (businessId && weekRange.start && weekRange.end) {
      fetchSubmissions();
    }
  }, [businessId, weekRange]);

  // חישוב סטטיסטיקות עובדים
  const calculateEmployeeStats = (): EmployeeStats[] => {
    console.log('📊 Calculating employee stats with:', {
      submissionsCount: submissionsData.length,
      submissionsData: submissionsData,
      shiftsCount: shifts.length
    });

    const activeEmployees = employees.filter(emp => emp.is_active && !emp.is_archived);
    
    return activeEmployees.map(employee => {
      // משמרות שבפועל הוקצו לעובד
      const employeeShifts = shifts.filter(shift => shift.employee_id === employee.id);
      
      // קיבוץ משמרות לפי תאריך ושעות (משמרות באותן שעות נחשבות כמשמרת אחת)
      const uniqueShiftSlots = employeeShifts.reduce((acc, shift) => {
        const key = `${shift.shift_date}-${shift.start_time}-${shift.end_time}`;
        if (!acc[key]) {
          acc[key] = shift;
        }
        return acc;
      }, {} as Record<string, ShiftScheduleData>);
      
      const uniqueShifts = Object.values(uniqueShiftSlots);
      
      // מציאת הגשות העובד
      const employeeSubmissions = submissionsData.filter(submission => 
        submission.employee_id === employee.id
      );
      
      // ספירת כמות המשמרות שביקש בכל ההגשות (מתוך מערך shifts בכל הגשה)
      const requestedShiftsDetails = employeeSubmissions.flatMap(submission => 
        submission.shifts || []
      );
      
      // קיבוץ בקשות לפי תאריך ושעות
      const uniqueRequestedSlots = requestedShiftsDetails.reduce((acc, request: any) => {
        if (request && request.date && request.start_time && request.end_time) {
          const key = `${request.date}-${request.start_time}-${request.end_time}`;
          if (!acc[key]) {
            acc[key] = request;
          }
        }
        return acc;
      }, {} as Record<string, any>);
      
      const uniqueRequests = Object.values(uniqueRequestedSlots);
      
      console.log(`📊 Employee ${employee.first_name} ${employee.last_name}:`, {
        totalShifts: employeeShifts.length,
        uniqueShifts: uniqueShifts.length,
        employeeSubmissions: employeeSubmissions.length,
        totalRequests: requestedShiftsDetails.length,
        uniqueRequests: uniqueRequests.length
      });
      
      // חישוב כמה מהבקשות התממשו - בדיקה מדויקת לפי תאריך, זמן וסניף
      const successfulRequests = uniqueRequests.filter((request: any) => {
        if (!request || !request.date || !request.start_time || !request.end_time) {
          return false;
        }
        
        return uniqueShifts.some(shift => {
          const matchDate = shift.shift_date === request.date;
          const matchTime = shift.start_time === request.start_time && shift.end_time === request.end_time;
          
          // בדיקת סניף - נשווה לפי שם הסניף או ID
          const matchBranch = shift.branch_id ? 
            // אם יש branch_id במשמרת, נחפש את הסניף המתאים
            branches.some(branch => 
              branch.id === shift.branch_id && 
              (branch.name === request.branch_preference || branch.id === request.branch_preference)
            ) :
            // אם אין branch_id, נשווה רק לפי שם
            request.branch_preference;
            
          const isMatch = matchDate && matchTime && matchBranch;
          
          if (isMatch) {
            console.log(`✅ Match found for ${employee.first_name}:`, {
              requestDate: request.date,
              shiftDate: shift.shift_date,
              requestTime: `${request.start_time}-${request.end_time}`,
              shiftTime: `${shift.start_time}-${shift.end_time}`,
              requestBranch: request.branch_preference,
              shiftBranchId: shift.branch_id
            });
          }
          
          return isMatch;
        });
      });
      
      const assignedShifts = uniqueShifts.length; // ספירת משמרות ייחודיות
      const submittedShiftsCount = employeeSubmissions.length; // כמות ההגשות
      const requestedShiftsCount = uniqueRequests.length; // כמות הבקשות הייחודיות
      const successfulShiftsCount = successfulRequests.length; // כמות הבקשות שהתממשו
      
      const submissionSuccessRate = requestedShiftsCount > 0 
        ? Math.round((successfulShiftsCount / requestedShiftsCount) * 100)
        : 0;
      
      const totalHours = employeeShifts.reduce((total, shift) => {
        if (shift.start_time && shift.end_time) {
          const start = new Date(`2000-01-01T${shift.start_time}`);
          const end = new Date(`2000-01-01T${shift.end_time}`);
          return total + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        }
        return total;
      }, 0);
      
      const requiredHours = employee.weekly_hours_required || 40;
      const status: 'over' | 'under' | 'exact' = 
        totalHours > requiredHours ? 'over' :
        totalHours < requiredHours ? 'under' : 'exact';

      const stats = {
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        assignedShifts,
        submittedShifts: submittedShiftsCount,
        requestedShifts: requestedShiftsCount,
        totalHours: Math.round(totalHours * 10) / 10,
        status,
        shifts: employeeShifts,
        submissionSuccessRate
      };

      console.log(`📊 Final stats for ${stats.employeeName}:`, {
        ...stats,
        successfulShiftsCount,
        requestedShiftsDetails: requestedShiftsDetails.length
      });
      
      return stats;
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'he'));
  };

  const employeeStats = calculateEmployeeStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'under': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'exact': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'border-orange-200 bg-orange-50';
      case 'under': return 'border-red-200 bg-red-50';
      case 'exact': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'over': return 'מעל הנדרש';
      case 'under': return 'מתחת לנדרש';
      case 'exact': return 'בדיוק כנדרש';
      default: return 'לא ידוע';
    }
  };

  const overWorkedEmployees = employeeStats.filter(emp => emp.status === 'over');
  const underWorkedEmployees = employeeStats.filter(emp => emp.status === 'under');

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            סטטיסטיקות עובדים לשבוע
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* סיכום כללי */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{employeeStats.length}</div>
              <div className="text-sm text-blue-700">סה"כ עובדים פעילים</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {employeeStats.reduce((total, emp) => total + emp.submittedShifts, 0)}
              </div>
              <div className="text-sm text-green-700">סה"כ הגשות</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {employeeStats.reduce((total, emp) => total + emp.requestedShifts, 0)}
              </div>
              <div className="text-sm text-purple-700">סה"כ בקשות למשמרות</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {employeeStats.reduce((total, emp) => total + emp.assignedShifts, 0)}
              </div>
              <div className="text-sm text-orange-700">סה"כ משמרות שוצבו</div>
            </div>
          </div>

          {/* התראות */}
          {(overWorkedEmployees.length > 0 || underWorkedEmployees.length > 0) && (
            <div className="mb-6 space-y-2">
              {overWorkedEmployees.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{overWorkedEmployees.length} עובדים</strong> עובדים מעל השעות הנדרשות: {' '}
                    {overWorkedEmployees.map(emp => emp.employeeName).join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              {underWorkedEmployees.length > 0 && (
                <Alert variant="destructive">
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{underWorkedEmployees.length} עובדים</strong> עובדים מתחת לשעות הנדרשות: {' '}
                    {underWorkedEmployees.map(emp => emp.employeeName).join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* רשימת עובדים */}
          {employeeStats.length > 0 ? (
            <div className="space-y-3">
              {employeeStats.map((employee) => (
                <div
                  key={employee.employeeId}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(employee.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(employee.status)}
                        <span className="font-semibold text-lg">{employee.employeeName}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(employee.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{employee.submittedShifts}</div>
                        <div className="text-gray-600">הגשות</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">{employee.requestedShifts}</div>
                        <div className="text-gray-600">בקשות</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{employee.assignedShifts}</div>
                        <div className="text-gray-600">שוצבו</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">{employee.totalHours}ש'</div>
                        <div className="text-gray-600">סה"כ שעות</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-teal-600">{employee.submissionSuccessRate}%</div>
                        <div className="text-gray-600">אחוז הצלחה</div>
                      </div>
                    </div>
                  </div>

                  {/* פירוט משמרות */}
                  {employee.shifts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">
                        משמרות שוצבו ({employee.shifts.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {employee.shifts.slice(0, 5).map((shift, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {new Date(shift.shift_date).toLocaleDateString('he-IL', { 
                              weekday: 'short', 
                              day: 'numeric',
                              month: 'numeric'
                            })} {shift.start_time}-{shift.end_time}
                          </Badge>
                        ))}
                        {employee.shifts.length > 5 && (
                          <span className="text-xs text-gray-500">
                            ועוד {employee.shifts.length - 5}...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>אין עובדים עם משמרות השבוע</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};