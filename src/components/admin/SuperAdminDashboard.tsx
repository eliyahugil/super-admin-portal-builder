
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  UserPlus,
  Settings, 
  Activity, 
  TrendingUp,
  Globe,
  Shield,
  Database,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const [businessesRes, usersRes, requestsRes] = await Promise.all([
        supabase.from('businesses').select('id').eq('is_active', true),
        supabase.from('profiles').select('id'),
        supabase.from('user_access_requests').select('id').eq('status', 'pending')
      ]);

      return {
        totalBusinesses: businessesRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        pendingRequests: requestsRes.data?.length || 0,
      };
    },
  });

  const quickActions = [
    {
      title: 'ניהול עסקים',
      description: 'צור ונהל עסקים במערכת',
      icon: Building,
      color: 'bg-blue-500',
      action: () => navigate('/admin/businesses')
    },
    {
      title: 'בקשות גישה',
      description: 'אשר או דחה בקשות גישה למערכת',
      icon: UserPlus,
      color: 'bg-green-500',
      action: () => navigate('/admin/access-requests'),
      badge: stats?.pendingRequests || 0
    },
    {
      title: 'ניהול משתמשים',
      description: 'נהל משתמשי המערכת והרשאות',
      icon: Users,
      color: 'bg-purple-500',
      action: () => navigate('/admin/users')
    },
    {
      title: 'הגדרות מערכת',
      description: 'קבע הגדרות כלליות למערכת',
      icon: Settings,
      color: 'bg-gray-500',
      action: () => navigate('/admin/system-config')
    },
    {
      title: 'אינטגרציות',
      description: 'נהל אינטגרציות עם מערכות חיצוניות',
      icon: Globe,
      color: 'bg-orange-500',
      action: () => navigate('/admin/integrations')
    },
    {
      title: 'דוחות ואנליטיקה',
      description: 'צפה בדוחות שימוש ופעילות',
      icon: BarChart3,
      color: 'bg-indigo-500',
      action: () => navigate('/admin/analytics')
    }
  ];

  const statsCards = [
    {
      title: 'עסקים פעילים',
      value: stats?.totalBusinesses || 0,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'משתמשים במערכת',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'בקשות ממתינות',
      value: stats?.pendingRequests || 0,
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'אבטחה',
      value: 'פעילה',
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" dir="rtl">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            לוח בקרה - מנהל על
          </h1>
          <p className="text-gray-600 mt-2">
            ברוך הבא לממשק ניהול המערכת המרכזי
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} ml-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600" dir="rtl">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader dir="rtl">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              פעולות מהירות
            </CardTitle>
            <CardDescription>
              גש למשימות הניהול הנפוצות ביותר
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white relative`}>
                        <action.icon className="h-5 w-5" />
                        {action.badge && action.badge > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1" dir="rtl">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader dir="rtl">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              מצב המערכת
            </CardTitle>
            <CardDescription>
              מידע על ביצועי המערכת ותקינותה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">מסד נתונים פעיל</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">אבטחה פעילה</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">גיבויים פעילים</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
