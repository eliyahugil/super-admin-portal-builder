
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';
import { Button } from '@/components/ui/button';

interface GoogleCalendarEventsTableProps {
  events: GoogleCalendarEvent[];
  businessId: string;
  className?: string;
}

export const GoogleCalendarEventsTable: React.FC<GoogleCalendarEventsTableProps> = ({
  events,
  businessId,
  className = ''
}) => {
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('he-IL'),
      time: date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}:${diffMinutes.toString().padStart(2, '0')} שעות`;
    }
    return `${diffMinutes} דקות`;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10);
  };

  const upcomingEvents = getUpcomingEvents();
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                <div className="text-sm text-gray-600">סה"כ אירועים</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{todayEvents.length}</div>
                <div className="text-sm text-gray-600">אירועי היום</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{upcomingEvents.length}</div>
                <div className="text-sm text-gray-600">אירועים קרובים</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              אירועי היום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayEvents.map((event) => {
                const startTime = formatDateTime(event.start_time);
                const endTime = formatDateTime(event.end_time);
                
                return (
                  <div key={event.id} className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{startTime.time} - {endTime.time}</span>
                          <span>{getEventDuration(event.start_time, event.end_time)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        היום
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            כל האירועים מ-Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>לא נמצאו אירועים מ-Google Calendar</p>
              <p className="text-sm mt-2">ודא שהאינטגרציה מוגדרת כראוי</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">כותרת</TableHead>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">שעה</TableHead>
                  <TableHead className="text-right">משך</TableHead>
                  <TableHead className="text-right">מיקום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const startTime = formatDateTime(event.start_time);
                  const endTime = formatDateTime(event.end_time);
                  const isToday = startTime.date === new Date().toLocaleDateString('he-IL');
                  const isPast = new Date(event.end_time) < new Date();
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{startTime.date}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{startTime.time} - {endTime.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getEventDuration(event.start_time, event.end_time)}
                      </TableCell>
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32" title={event.location}>
                              {event.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={
                            isToday ? 'bg-green-100 text-green-800' :
                            isPast ? 'bg-gray-100 text-gray-600' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {isToday ? 'היום' : isPast ? 'עבר' : 'עתידי'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
