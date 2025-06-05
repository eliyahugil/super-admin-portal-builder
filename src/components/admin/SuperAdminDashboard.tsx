import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Globe, 
  Puzzle,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { EmployeeRequestsApproval } from '@/components/modules/employees/EmployeeRequestsApproval';

export const SuperAdminDashboard: React.FC = () => {
  // Mock data - יוחלף בנתונים אמיתיים
  const systemStats = {
    totalBusinesses: 47,
    activeBusinesses: 42,
    totalUsers: 1247,
    activeModules: 12,
    pendingApprovals: 3,
    systemHealth: 98.5
  };

  const quickActions = [
    {
      title: 'ניהול עסקים',
      description: 'הוסף, ערוך ונהל עסקים במערכת',
      icon: Building2,
      link: '/admin/businesses',
      color: 'bg-blue-500',
      stats: `${systemStats.totalBusinesses} עסקים`
    },
    {
      title: 'ניהול מודולים',
      description: 'נהל מודולים והרשאות עבור עסקים',
      icon: Puzzle,
      link: '/admin/modules',
      color: 'bg-green-500',
      stats: `${systemStats.activeModules} מודולים פעילים`
    },
    {
      title: 'אינטגרציות כלליות',
      description: 'הגדר אינטגרציות זמינות לכל העסקים',
      icon: Globe,
      link: '/admin/integrations',
      color: 'bg-purple-500',
      stats: '8 אינטגרציות זמינות'
    },
    {
      title: 'תצוגת מערכת',
      description: 'בדוק ותצוג מודולים לפני פרסום',
      icon: Activity,
      link: '/admin/system-preview',
      color: 'bg-orange-500',
      stats: 'בדיקת איכות'
    }
  ];

  const recentActivity = [
    {
      type: 'business',
      title: 'עסק חדש נרשם',
      description: 'קפה ברחוב הראשי - דורש אישור',
      time: '10 דקות',
      status: 'pending'
    },
    {
      type: 'module',
      title: 'מודול עודכן',
      description: 'ניהול עובדים - גרסה 2.1',
      time: '2 שעות',
      status: 'completed'
    },
    {
      type: 'integration',
      title: 'אינטגרציה חדשה',
      description: 'WhatsApp API - הוגדרה בהצלחה',
      time: '1 יום',
      status: 'completed'
    }
  ];

  const systemAlerts = [
    {
      type: 'warning',
      title: 'עסקים ממתינים לאישור',
      description: `${systemStats.pendingApprovals} עסקים ממתינים לבדיקה ואישור`,
      action: 'לבדיקה'
    },
    {
      type: 'info',
      title: 'עדכון מערכת זמין',
      description: 'גרסה 1.2.5 כוללת שיפורים בביצועים',
      action: 'פרטים'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">לוח בקרה - סופר אדמין</h1>
        <p className="text-gray-600 mt-2">
          ברוך הבא למערכת הניהול הראשית - נהל עסקים, מודולים ואינטגרציות
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עסקים פעילים</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeBusinesses}</div>
            <p className="text-xs text-muted-foreground">
              מתוך {systemStats.totalBusinesses} עסקים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משתמשים במערכת</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              משתמשים רשומים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">מודולים פעילים</CardTitle>
            <Puzzle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeModules}</div>
            <p className="text-xs text-muted-foreground">
              מודולים זמינים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תקינות מערכת</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              זמינות מערכת
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>גישה מהירה לפונקציות הניהול הראשיות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {action.stats}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Requests Approval Section */}
      <section className="mb-8">
        <EmployeeRequestsApproval />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>עדכונים ופעילות במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0">
                    {activity.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-orange-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      לפני {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>התראות מערכת</CardTitle>
            <CardDescription>התראות חשובות הדורשות תשומת לב</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
