
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Activity, Users, Building } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { IntegrationManagement } from '../modules/integrations/IntegrationManagement';

export const IntegrationDashboard: React.FC = () => {
  const { isSuperAdmin, businessId } = useBusiness();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - will be replaced with real data
  const stats = {
    totalIntegrations: 12,
    activeIntegrations: 8,
    businessIntegrations: businessId ? 5 : 0,
    pendingApprovals: isSuperAdmin ? 3 : 0
  };

  const quickActions = [
    {
      title: 'הוסף אינטגרציה',
      description: 'חבר שירות חדש לעסק',
      icon: Plus,
      action: () => console.log('Add integration'),
      color: 'bg-blue-500'
    },
    {
      title: 'נהל הגדרות',
      description: 'ערוך הגדרות אינטגרציות קיימות',
      icon: Settings,
      action: () => console.log('Manage settings'),
      color: 'bg-green-500'
    },
    {
      title: 'צפה בלוגים',
      description: 'בדוק סטטוס וביצועים',
      icon: Activity,
      action: () => console.log('View logs'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isSuperAdmin ? 'ניהול אינטגרציות כללי' : 'אינטגרציות העסק'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isSuperAdmin 
            ? 'נהל אינטגרציות זמינות לכל העסקים במערכת'
            : 'נהל את האינטגרציות של העסק עם שירותים חיצוניים'
          }
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל אינטגרציות</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">זמינות במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אינטגרציות פעילות</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeIntegrations}</div>
            <p className="text-xs text-muted-foreground">פועלות כעת</p>
          </CardContent>
        </Card>

        {businessId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">אינטגרציות העסק</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.businessIntegrations}</div>
              <p className="text-xs text-muted-foreground">מוגדרות עבור העסק</p>
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממתינות לאישור</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">דורשות בדיקה</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>גישה מהירה לפונקציות הניהול הראשיות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="management">ניהול אינטגרציות</TabsTrigger>
          <TabsTrigger value="logs">לוגים וביצועים</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>אינטגרציות מומלצות</CardTitle>
                <CardDescription>שירותים פופולריים לעסקים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Google Maps', 'WhatsApp Business', 'Facebook Leads', 'iCount'].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{integration}</p>
                      <p className="text-sm text-gray-500">מותקן ב-{Math.floor(Math.random() * 50 + 10)} עסקים</p>
                    </div>
                    <Button variant="outline" size="sm">התקן</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
                <CardDescription>עדכונים ופעילות באינטגרציות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'הותקן Google Maps', time: '5 דקות', status: 'success' },
                  { action: 'עודכן WhatsApp API', time: '2 שעות', status: 'success' },
                  { action: 'שגיאה ב-Facebook Leads', time: '1 יום', status: 'error' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">לפני {activity.time}</p>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                      {activity.status === 'success' ? 'הצליח' : 'שגיאה'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <IntegrationManagement />
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>לוגים וביצועים</CardTitle>
              <CardDescription>מעקב אחר פעילות האינטגרציות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ממשק לוגים יהיה זמין בקרוב</p>
                  <p className="text-sm text-gray-400">כאן תוכל לצפות בביצועים ושגיאות</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
