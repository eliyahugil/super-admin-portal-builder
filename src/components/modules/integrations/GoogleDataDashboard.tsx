import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { 
  Calendar, 
  Mail, 
  HardDrive, 
  TrendingUp,
  Clock,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';

interface GoogleDataDashboardProps {
  businessId: string;
}

interface DataSummary {
  totalEvents: number;
  upcomingEvents: number;
  totalContacts: number;
  filesStored: number;
  emailsSent: number;
  lastSyncTime: string;
}

export const GoogleDataDashboard: React.FC<GoogleDataDashboardProps> = ({ businessId }) => {
  const { events, integrations, loading } = useGoogleCalendar(businessId);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSummary, setDataSummary] = useState<DataSummary>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalContacts: 0,
    filesStored: 0,
    emailsSent: 0,
    lastSyncTime: ''
  });

  useEffect(() => {
    // Calculate data summary
    const now = new Date();
    const upcomingEvents = events.filter(event => 
      new Date(event.start_time) > now
    ).length;

    setDataSummary({
      totalEvents: events.length,
      upcomingEvents,
      totalContacts: 0, // Will be implemented when contacts API is ready
      filesStored: 0, // Will be implemented when Drive API is ready
      emailsSent: 0, // Will be implemented when Gmail API is ready
      lastSyncTime: integrations.length > 0 
        ? integrations[0].last_sync_at || 'אף פעם' 
        : 'אף פעם'
    });
  }, [events, integrations]);

  const stats = [
    {
      title: 'אירועי Calendar',
      value: dataSummary.totalEvents,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'אירועים קרובים',
      value: dataSummary.upcomingEvents,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'אנשי קשר',
      value: dataSummary.totalContacts,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'קבצים ב-Drive',
      value: dataSummary.filesStored,
      icon: HardDrive,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivity = [
    {
      type: 'calendar',
      action: 'סונכרן אירוע חדש',
      details: 'פגישת צוות - מחר 10:00',
      time: '5 דקות',
      icon: Calendar
    },
    {
      type: 'gmail',
      action: 'נשלח אימייל',
      details: 'התראה על משמרת חדשה',
      time: '15 דקות',
      icon: Mail
    },
    {
      type: 'drive',
      action: 'נשמר קובץ',
      details: 'דוח משמרות חודשי.pdf',
      time: '1 שעה',
      icon: FileText
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                סקירת נתונים מGoogle
              </CardTitle>
              <CardDescription>
                נתונים מסונכרנים מכל שירותי Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="drive">Drive</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="חפש אירועים..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      רענן
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {events
                      .filter(event => 
                        event.title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(event.start_time).toLocaleString('he-IL')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {event.status === 'confirmed' ? 'מאושר' : event.status}
                          </Badge>
                        </div>
                      ))}
                    
                    {events.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">אין אירועים לתצוגה</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contacts">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">נתוני Contacts יהיו זמינים בקרוב</p>
                  </div>
                </TabsContent>

                <TabsContent value="drive">
                  <div className="text-center py-8">
                    <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">נתוני Drive יהיו זמינים בקרוב</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>פעילות אחרונה</CardTitle>
              <CardDescription>
                עדכונים מהשעות האחרונות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <IconComponent className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">לפני {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">סטטוס סנכרון</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calendar</span>
                  <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gmail</span>
                  <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Drive</span>
                  <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  סנכרון אחרון: {dataSummary.lastSyncTime}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
