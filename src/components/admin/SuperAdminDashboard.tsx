
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

  // Fetch dashboard stats with error handling
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching super admin stats...');
        const [businessesRes, usersRes, requestsRes] = await Promise.all([
          supabase.from('businesses').select('id').eq('is_active', true),
          supabase.from('profiles').select('id'),
          supabase.from('user_access_requests').select('id').eq('status', 'pending')
        ]);

        const result = {
          totalBusinesses: businessesRes.data?.length || 0,
          totalUsers: usersRes.data?.length || 0,
          pendingRequests: requestsRes.data?.length || 0,
        };
        
        console.log('✅ Super admin stats loaded:', result);
        return result;
      } catch (error) {
        console.error('❌ Error fetching super admin stats:', error);
        return {
          totalBusinesses: 0,
          totalUsers: 0,
          pendingRequests: 0,
        };
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-right">
          <div className="inline-flex items-center justify-center sm:justify-start gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                לוח בקרה - מנהל על
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                ברוך הבא לממשק ניהול המערכת המרכזי
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
              <CardContent className="relative p-4 sm:p-6">
                <div className="text-center sm:text-right">
                  <div className={`inline-flex p-3 rounded-2xl ${stat.bgColor} mb-3`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
              <Activity className="h-5 w-5" />
              פעולות מהירות
            </CardTitle>
            <p className="text-blue-100 text-sm mt-1">
              גש למשימות הניהול הנפוצות ביותר
            </p>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-blue-200 hover:-translate-y-1" 
                  onClick={action.action}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl ${action.color} text-white relative shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <action.icon className="h-5 w-5" />
                        {action.badge && action.badge > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
              <Database className="h-5 w-5" />
              מצב המערכת
            </CardTitle>
            <p className="text-emerald-100 text-sm mt-1">
              מידע על ביצועי המערכת ותקינותה
            </p>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">מסד נתונים פעיל</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">אבטחה פעילה</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">גיבויים פעילים</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
