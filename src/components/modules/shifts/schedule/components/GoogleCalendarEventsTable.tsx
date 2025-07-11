
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import type { GoogleCalendarEvent } from '@/types/calendar';

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
  console.log('📅 GoogleCalendarEventsTable rendered with:', {
    eventsCount: events.length,
    businessId
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('he-IL'),
      time: date.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  if (events.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              אין אירועי Google Calendar
            </h3>
            <p className="text-gray-500">
              לא נמצאו אירועים מחוברים מ-Google Calendar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          אירועי Google Calendar ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => {
            const startTime = formatDateTime(event.start_time);
            const endTime = formatDateTime(event.end_time);
            
            return (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {event.title}
                  </h3>
                  <Badge variant="outline" className="mr-2">
                    {event.is_all_day ? 'יום מלא' : 'מתוזמן'}
                  </Badge>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{startTime.date}</span>
                  </div>
                  
                  {!event.is_all_day && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{startTime.time} - {endTime.time}</span>
                    </div>
                  )}
                  
                  {event.google_event_id && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-xs">Google Event</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
