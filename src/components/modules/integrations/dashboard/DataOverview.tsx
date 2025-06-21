
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Users, HardDrive, RefreshCw } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';

interface DataOverviewProps {
  events: GoogleCalendarEvent[];
}

export const DataOverview: React.FC<DataOverviewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
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
  );
};
