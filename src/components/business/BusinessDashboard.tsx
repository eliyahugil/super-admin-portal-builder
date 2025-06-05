
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

export const BusinessDashboard: React.FC = () => {
  const { businessId } = useParams();

  // Mock business data
  const businessData = {
    id: businessId,
    name: 'קפה ברחוב הראשי',
    owner: 'יוסי כהן',
    employees: 12,
    revenue: 45600,
    notifications: 3
  };

  const quickStats = [
    {
      title: 'עובדים פעילים',
      value: businessData.employees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'הכנסות חודשיות',
      value: `₪${businessData.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'משמרות השבוע',
      value: '42',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'התראות',
      value: businessData.notifications,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivity = [
    {
      title: 'עובד חדש נוסף',
      description: 'מרים כהן נוספה למערכת',
      time: '10 דקות',
      type: 'employee'
    },
    {
      title: 'משמרת עודכנה',
      description: 'משמרת ערב - ראשון עודכנה',
      time: '2 שעות',
      type: 'shift'
    },
    {
      title: 'חשבונית נוצרה',
      description: 'חשבונית #1234 נוצרה',
      time: '1 יום',
      type: 'invoice'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{businessData.name}</h1>
            <p className="text-gray-600 mt-2">דשבורד ניהול העסק</p>
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
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>עדכונים ופעילות בעסק</CardDescription>
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
                      לפני {activity.time}
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
