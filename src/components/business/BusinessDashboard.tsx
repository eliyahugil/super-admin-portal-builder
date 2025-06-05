
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Bell,
  Settings,
  Eye
} from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { useBusiness } from '@/hooks/useBusiness';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color, bgColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="mr-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const BusinessDashboard: React.FC = () => {
  const { businessId: urlBusinessId } = useParams();
  const { businessId, business, isLoading: businessLoading } = useBusiness();
  
  // Use businessId from URL if available, otherwise use from context
  const currentBusinessId = urlBusinessId || businessId;

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', currentBusinessId],
    tableName: 'employees',
    filters: currentBusinessId !== 'super_admin' ? { business_id: currentBusinessId } : {},
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: shifts } = useRealData<any>({
    queryKey: ['shifts-today', currentBusinessId],
    tableName: 'scheduled_shifts',
    filters: { shift_date: new Date().toISOString().split('T')[0] },
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: attendance } = useRealData<any>({
    queryKey: ['attendance-today', currentBusinessId],
    tableName: 'attendance_records',
    enabled: !!currentBusinessId && !businessLoading
  });

  const { data: requests } = useRealData<any>({
    queryKey: ['pending-requests', currentBusinessId],
    tableName: 'employee_requests',
    filters: { status: 'pending' },
    enabled: !!currentBusinessId && !businessLoading
  });

  // Filter today's attendance records
  const todayAttendance = attendance?.filter((record: any) => {
    const recordDate = new Date(record.recorded_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  }) || [];

  const activeEmployees = employees?.filter((emp: any) => emp.is_active) || [];
  
  const quickStats = [
    {
      title: 'עובדים פעילים',
      value: activeEmployees.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'משמרות היום',
      value: shifts?.length || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'כניסות היום',
      value: todayAttendance.length,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'בקשות ממתינות',
      value: requests?.length || 0,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivity = [
    {
      title: 'נתונים אמיתיים זמינים',
      description: 'המערכת מציגה נתונים אמיתיים מהמסד נתונים',
      time: 'עכשיו',
      type: 'system'
    },
    {
      title: `${activeEmployees.length} עובדים פעילים`,
      description: 'עובדים רשומים במערכת',
      time: 'עדכון אחרון',
      type: 'employee'
    },
    {
      title: `${shifts?.length || 0} משמרות היום`,
      description: 'משמרות מתוכננות להיום',
      time: 'היום',
      type: 'shift'
    }
  ];

  if (businessLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {business?.name || 'דשבורד עסקי'}
            </h1>
            <p className="text-gray-600 mt-2">דשבורד ניהול העסק - נתונים אמיתיים</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              הגדרות
            </Button>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              תצוגת לקוח
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>עדכונים ופעילות בעסק (נתונים אמיתיים)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>פעולות מהירות</CardTitle>
            <CardDescription>גישה מהירה לפונקציות נפוצות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                הוסף עובד
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                נהל משמרות
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                צור חשבונית
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                דוחות
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
