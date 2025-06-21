
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleCalendarEventsList } from '../GoogleCalendarEventsList';
import { Mail, HardDrive, Users } from 'lucide-react';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';

interface GoogleServicesDataProps {
  events: GoogleCalendarEvent[];
}

export const GoogleServicesData: React.FC<GoogleServicesDataProps> = ({ events }) => {
  return (
    <Tabs defaultValue="calendar" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="gmail">Gmail</TabsTrigger>
        <TabsTrigger value="drive">Drive</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar">
        <GoogleCalendarEventsList events={events} />
      </TabsContent>

      <TabsContent value="gmail">
        <Card>
          <CardHeader>
            <CardTitle>Gmail</CardTitle>
            <CardDescription>
              נתוני Gmail יהיו זמינים בקרוב
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ממשק Gmail בפיתוח</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="drive">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive</CardTitle>
            <CardDescription>
              נתוני Drive יהיו זמינים בקרוב
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ממשק Drive בפיתוח</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>Google Contacts</CardTitle>
            <CardDescription>
              נתוני Contacts יהיו זמינים בקרוב
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ממשק Contacts בפיתוח</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
