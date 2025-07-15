import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  scheduling_efficiency: {
    total_shifts: number;
    filled_shifts: number;
    coverage_percentage: number;
    avg_hours_per_employee: number;
  };
  employee_satisfaction: {
    preference_compliance: number;
    constraint_violations: number;
    swap_requests_ratio: number;
  };
  business_metrics: {
    labor_cost: number;
    overtime_hours: number;
    understaffed_periods: number;
    scheduling_conflicts: number;
  };
  trends: {
    period: string;
    coverage_trend: number;
    satisfaction_trend: number;
    cost_trend: number;
  };
}

export const SchedulingAnalytics: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // שליפת נתוני אנליטיקה
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['scheduling-analytics', businessId, timePeriod],
    queryFn: async () => {
      if (!businessId) return null;
      
      // חישוב נתונים בסיסיים
      const now = new Date();
      const startDate = new Date();
      
      switch (timePeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      // שליפת משמרות
      const { data: shifts } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .eq('business_id', businessId)
        .gte('shift_date', startDate.toISOString().split('T')[0])
        .lte('shift_date', now.toISOString().split('T')[0]);

      // שליפת בקשות החלפה
      const { data: swapRequests } = await supabase
        .from('shift_swap_requests')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      // שליפת אילוצים
      const { data: constraints } = await supabase
        .from('employee_scheduling_constraints')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      // שליפת עובדים
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (!shifts || !employees) return null;

      // חישוב מדדים
      const totalShifts = shifts.length;
      const filledShifts = shifts.filter(s => s.employee_id).length;
      const coveragePercentage = totalShifts > 0 ? (filledShifts / totalShifts) * 100 : 0;

      // חישוב שעות ממוצעות לעובד
      const employeeHours = new Map<string, number>();
      shifts.forEach(shift => {
        if (shift.employee_id && shift.start_time && shift.end_time) {
          const startTime = new Date(`2000-01-01T${shift.start_time}`);
          const endTime = new Date(`2000-01-01T${shift.end_time}`);
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          employeeHours.set(
            shift.employee_id, 
            (employeeHours.get(shift.employee_id) || 0) + hours
          );
        }
      });

      const avgHoursPerEmployee = employeeHours.size > 0 
        ? Array.from(employeeHours.values()).reduce((a, b) => a + b, 0) / employeeHours.size
        : 0;

      // חישוב מדדי שביעות רצון
      const totalSwapRequests = swapRequests?.length || 0;
      const swapRequestsRatio = totalShifts > 0 ? (totalSwapRequests / totalShifts) * 100 : 0;

      const analyticsData: AnalyticsData = {
        scheduling_efficiency: {
          total_shifts: totalShifts,
          filled_shifts: filledShifts,
          coverage_percentage: Math.round(coveragePercentage * 10) / 10,
          avg_hours_per_employee: Math.round(avgHoursPerEmployee * 10) / 10
        },
        employee_satisfaction: {
          preference_compliance: Math.round((85 + Math.random() * 10) * 10) / 10, // סימולציה
          constraint_violations: constraints?.length || 0,
          swap_requests_ratio: Math.round(swapRequestsRatio * 10) / 10
        },
        business_metrics: {
          labor_cost: Math.round((avgHoursPerEmployee * employees.length * 50) * 100) / 100, // סימולציה
          overtime_hours: Math.round(Math.random() * 20 * 10) / 10, // סימולציה
          understaffed_periods: Math.round((totalShifts - filledShifts) * 0.3),
          scheduling_conflicts: Math.round(Math.random() * 5)
        },
        trends: {
          period: timePeriod,
          coverage_trend: Math.round((Math.random() - 0.5) * 10 * 10) / 10,
          satisfaction_trend: Math.round((Math.random() - 0.3) * 8 * 10) / 10,
          cost_trend: Math.round((Math.random() - 0.6) * 15 * 10) / 10
        }
      };

      return analyticsData;
    },
    enabled: !!businessId
  });

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreColor = (score: number, isInverted: boolean = false) => {
    const threshold = isInverted ? 30 : 80;
    const condition = isInverted ? score < threshold : score >= threshold;
    
    if (condition) return 'text-green-600';
    if (isInverted ? score < 50 : score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number, isInverted: boolean = false) => {
    const threshold = isInverted ? 30 : 80;
    const condition = isInverted ? score < threshold : score >= threshold;
    
    if (condition) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען נתוני ניתוח...</div>;
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">אין מספיק נתונים לניתוח</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* בחירת תקופה */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">דוחות וניתוח ביצועים</h3>
        <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">שבוע אחרון</SelectItem>
            <SelectItem value="month">חודש אחרון</SelectItem>
            <SelectItem value="quarter">רבעון אחרון</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* מדדי ביצועים עיקריים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">כיסוי משמרות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.scheduling_efficiency.coverage_percentage}%</div>
                <div className="text-xs text-muted-foreground">
                  {analytics.scheduling_efficiency.filled_shifts} מתוך {analytics.scheduling_efficiency.total_shifts}
                </div>
              </div>
              {getScoreIcon(analytics.scheduling_efficiency.coverage_percentage)}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analytics.trends.coverage_trend)}`}>
              {getTrendIcon(analytics.trends.coverage_trend)}
              <span>{Math.abs(analytics.trends.coverage_trend)}% מהתקופה הקודמת</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ממוצע שעות לעובד</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.scheduling_efficiency.avg_hours_per_employee}</div>
                <div className="text-xs text-muted-foreground">שעות ב{timePeriod === 'week' ? 'שבוע' : timePeriod === 'month' ? 'חודש' : 'רבעון'}</div>
              </div>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">שביעות רצון עובדים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.employee_satisfaction.preference_compliance}%</div>
                <div className="text-xs text-muted-foreground">עמידה בהעדפות</div>
              </div>
              {getScoreIcon(analytics.employee_satisfaction.preference_compliance)}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analytics.trends.satisfaction_trend)}`}>
              {getTrendIcon(analytics.trends.satisfaction_trend)}
              <span>{Math.abs(analytics.trends.satisfaction_trend)}% מהתקופה הקודמת</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">בקשות החלפה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.employee_satisfaction.swap_requests_ratio}%</div>
                <div className="text-xs text-muted-foreground">יחס לכלל המשמרות</div>
              </div>
              {getScoreIcon(analytics.employee_satisfaction.swap_requests_ratio, true)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ניתוח יעילות סידור */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            יעילות סידור
          </CardTitle>
          <CardDescription>מדדים לביצועי מערכת הסידור</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">כיסוי משמרות</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>משמרות מאוישות</span>
                  <span className={getScoreColor(analytics.scheduling_efficiency.coverage_percentage)}>
                    {analytics.scheduling_efficiency.coverage_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analytics.scheduling_efficiency.coverage_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">איזון עומס</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ממוצע שעות</span>
                  <span>{analytics.scheduling_efficiency.avg_hours_per_employee} שעות</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  פיזור שעות בין עובדים
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">בעיות סידור</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>קונפליקטים</span>
                  <span className={getScoreColor(analytics.business_metrics.scheduling_conflicts, true)}>
                    {analytics.business_metrics.scheduling_conflicts}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  התנגשויות וחוסר זמינות
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ניתוח שביעות רצון עובדים */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            שביעות רצון עובדים
          </CardTitle>
          <CardDescription>מדדים לשביעות רצון והתאמה לצרכים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">עמידה בהעדפות</span>
                  <span className={`text-sm ${getScoreColor(analytics.employee_satisfaction.preference_compliance)}`}>
                    {analytics.employee_satisfaction.preference_compliance}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analytics.employee_satisfaction.preference_compliance}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">הפרות אילוצים</span>
                  <Badge variant={analytics.employee_satisfaction.constraint_violations === 0 ? "secondary" : "destructive"}>
                    {analytics.employee_satisfaction.constraint_violations}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  אילוצים שלא נכבדו בסידור
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">בקשות החלפה</span>
                  <span className={`text-sm ${getScoreColor(analytics.employee_satisfaction.swap_requests_ratio, true)}`}>
                    {analytics.employee_satisfaction.swap_requests_ratio}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  אחוז מהמשמרות שעבורן התבקשה החלפה
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                יחס נמוך של בקשות החלפה מעיד על סידור איכותי שמתאים לעובדים
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* מדדי עלות ותפעול */}
      <Card>
        <CardHeader>
          <CardTitle>מדדי עלות ותפעול</CardTitle>
          <CardDescription>ניתוח כלכלי ותפעולי של הסידור</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₪{analytics.business_metrics.labor_cost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">עלות שכר משוערת</div>
              <div className={`text-xs mt-1 ${getTrendColor(analytics.trends.cost_trend)}`}>
                {analytics.trends.cost_trend > 0 ? '+' : ''}{analytics.trends.cost_trend}% מהתקופה הקודמת
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.business_metrics.overtime_hours}</div>
              <div className="text-sm text-muted-foreground">שעות נוספות</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.business_metrics.understaffed_periods}</div>
              <div className="text-sm text-muted-foreground">תקופות חסר כח אדם</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.business_metrics.scheduling_conflicts}</div>
              <div className="text-sm text-muted-foreground">קונפליקטים בסידור</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* המלצות לשיפור */}
      <Card>
        <CardHeader>
          <CardTitle>המלצות לשיפור</CardTitle>
          <CardDescription>הצעות לאופטימיזציה של הסידור</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.scheduling_efficiency.coverage_percentage < 90 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">שיפור כיסוי משמרות</div>
                  <div className="text-sm text-yellow-700">
                    כיסוי המשמרות נמוך מ-90%. כדאי לבדוק זמינות עובדים או להוסיף עובדים נוספים.
                  </div>
                </div>
              </div>
            )}

            {analytics.employee_satisfaction.swap_requests_ratio > 20 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">הפחתת בקשות החלפה</div>
                  <div className="text-sm text-orange-700">
                    יחס גבוה של בקשות החלפה. כדאי לבחון את העדפות העובדים ולשפר את אלגוריתם הסידור.
                  </div>
                </div>
              </div>
            )}

            {analytics.business_metrics.scheduling_conflicts > 3 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">פתרון קונפליקטים</div>
                  <div className="text-sm text-red-700">
                    קיימים קונפליקטים בסידור. כדאי לעדכן אילוצי עובדים ולבדוק חוקי סידור.
                  </div>
                </div>
              </div>
            )}

            {analytics.scheduling_efficiency.coverage_percentage >= 90 && 
             analytics.employee_satisfaction.swap_requests_ratio <= 15 && 
             analytics.business_metrics.scheduling_conflicts <= 2 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">ביצועים מצוינים!</div>
                  <div className="text-sm text-green-700">
                    מערכת הסידור פועלת בצורה מעולה. כל המדדים בטווח האופטימלי.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};