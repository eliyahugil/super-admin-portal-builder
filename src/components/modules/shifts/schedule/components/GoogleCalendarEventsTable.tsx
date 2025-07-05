
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users, RefreshCw, Settings } from 'lucide-react';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

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
  const [searchTerm, setSearchTerm] = useState('');
  const { syncCalendar, isSyncing } = useGoogleCalendar(businessId);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return {
        date: date.toLocaleDateString('he-IL'),
        time: date.toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    } catch {
      return { date: '', time: '' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'tentative':
        return <Badge className="bg-yellow-100 text-yellow-800">זמני</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">מבוטל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSync = async () => {
    // This would typically sync with a specific calendar integration
    // For now, we'll just refresh the data
    window.location.reload();
  };

  return (
    <Card className={className} dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              אירועי Google Calendar
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              אירועים מסונכרנים מ-Google Calendar של העסק
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              סנכרן
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              הגדרות
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter */}
        <div className="mb-4">
          <Input
            placeholder="חפש אירועים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {events.length === 0 ? (
              <div>
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>אין אירועי Google Calendar זמינים</p>
                <p className="text-sm mt-1">וודא שהגדרת אינטגרציית Google Calendar</p>
              </div>
            ) : (
              <div>
                <p>לא נמצאו אירועים התואמים לחיפוש</p>
              </div>
            )}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">כותרת</TableHead>
                  <TableHead className="text-right">תאריך ושעה</TableHead>
                  <TableHead className="text-right">מיקום</TableHead>
                  <TableHead className="text-right">משתתפים</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const startDateTime = formatDateTime(event.start_time);
                  const endDateTime = formatDateTime(event.end_time);
                  
                  return (
                    <TableRow key={event.id} className="hover:bg-gray-50">
                      <TableCell className="text-right">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>{startDateTime.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>
                              {startDateTime.time}
                              {endDateTime.time && ` - ${endDateTime.time}`}
                            </span>
                          </div>
                          {event.is_all_day && (
                            <Badge variant="outline" className="text-xs">
                              כל היום
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {event.location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32">{event.location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">ללא מיקום</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {event.attendees && event.attendees.length > 0 ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees.length} משתתפים</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">אין משתתפים</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {getStatusBadge(event.status)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          צפה
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {/* Statistics */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-xs text-gray-600">סה"כ אירועים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'confirmed').length}
                </div>
                <div className="text-xs text-gray-600">מאושרים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {events.filter(e => e.status === 'tentative').length}
                </div>
                <div className="text-xs text-gray-600">זמניים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {events.filter(e => e.is_all_day).length}
                </div>
                <div className="text-xs text-gray-600">כל היום</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
