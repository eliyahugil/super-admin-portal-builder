
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoogleCalendarEvent } from '@/hooks/useGoogleCalendar';
import { Calendar, Clock, MapPin, Users, Filter } from 'lucide-react';

interface GoogleCalendarEventsListProps {
  events: GoogleCalendarEvent[];
}

export const GoogleCalendarEventsList: React.FC<GoogleCalendarEventsListProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || event.sync_direction === directionFilter;
    
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'tentative':
        return <Badge className="bg-yellow-100 text-yellow-800">זמני</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">בוטל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSyncDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'imported':
        return <Badge variant="secondary">מיובא</Badge>;
      case 'exported':
        return <Badge className="bg-blue-100 text-blue-800">מיוצא</Badge>;
      case 'bidirectional':
        return <Badge className="bg-purple-100 text-purple-800">דו כיווני</Badge>;
      default:
        return <Badge variant="outline">{direction}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string, isAllDay: boolean) => {
    const date = new Date(dateTime);
    
    if (isAllDay) {
      return date.toLocaleDateString('he-IL');
    }
    
    return date.toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          אירועי Google Calendar
        </CardTitle>
        <CardDescription>
          {events.length} אירועים סונכרנו מ-Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="חפש אירועים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="confirmed">מאושר</SelectItem>
              <SelectItem value="tentative">זמני</SelectItem>
              <SelectItem value="cancelled">בוטל</SelectItem>
            </SelectContent>
          </Select>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="כיוון" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הכיוונים</SelectItem>
              <SelectItem value="imported">מיובא</SelectItem>
              <SelectItem value="exported">מיוצא</SelectItem>
              <SelectItem value="bidirectional">דו כיווני</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                לא נמצאו אירועים
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'נסה לשנות את החיפוש' : 'אין אירועים לתצוגה'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(event.status)}
                    {getSyncDirectionBadge(event.sync_direction)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">התחלה</p>
                      <p className="text-gray-600">
                        {formatDateTime(event.start_time, event.is_all_day)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">סיום</p>
                      <p className="text-gray-600">
                        {formatDateTime(event.end_time, event.is_all_day)}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">מיקום</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">משתתפים</p>
                        <p className="text-gray-600">{event.attendees.length} משתתפים</p>
                      </div>
                    </div>
                  )}
                </div>

                {event.is_all_day && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      אירוע יום שלם
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {filteredEvents.length > 10 && (
          <div className="flex justify-center pt-4">
            <Button variant="outline">
              טען עוד אירועים
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
