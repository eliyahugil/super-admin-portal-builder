
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Star, Heart } from 'lucide-react';

interface CombinedEvent {
  id: string;
  date: string;
  title: string;
  type: 'holiday' | 'shabbat';
  category: string;
  isWorkingDay?: boolean;
  candleLighting?: string;
  havdalah?: string;
  data?: any;
}

interface HolidayDesktopTableProps {
  filteredEvents: CombinedEvent[];
  typeFilter: string;
  formatDate: (dateStr: string) => { full: string; dayOfWeek: string };
  getHolidayTimes: (event: CombinedEvent) => { entry: string | null; exit: string | null };
}

export const HolidayDesktopTable: React.FC<HolidayDesktopTableProps> = ({
  filteredEvents,
  typeFilter,
  formatDate,
  getHolidayTimes
}) => {
  const getEventIcon = (event: CombinedEvent) => {
    if (event.type === 'shabbat') {
      return <Calendar className="h-4 w-4 text-purple-600" />;
    }
    
    switch (event.category) {
      case 'חג':
      case 'מועד':
        return <Star className="h-4 w-4 text-green-600" />;
      case 'יום זיכרון':
        return <Heart className="h-4 w-4 text-gray-600" />;
      case 'יום עצמאות':
        return <Star className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {typeFilter === 'all' ? 'כל האירועים' : `${typeFilter} (${filteredEvents.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>אין אירועים מסוג זה</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-right p-3 font-medium text-gray-700">סוג</th>
                  <th className="text-right p-3 font-medium text-gray-700">שם האירוע</th>
                  <th className="text-right p-3 font-medium text-gray-700">תאריך</th>
                  <th className="text-right p-3 font-medium text-gray-700">יום בשבוע</th>
                  <th className="text-right p-3 font-medium text-gray-700">זמנים</th>
                  <th className="text-right p-3 font-medium text-gray-700">יום עבודה</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  const times = getHolidayTimes(event);
                  
                  return (
                    <tr key={event.id} className="border-b hover:bg-gray-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event)}
                          <Badge variant="secondary" className="text-xs">
                            {event.type === 'shabbat' ? 'שבת' : event.category}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{event.title}</td>
                      <td className="p-3">{dateInfo.full}</td>
                      <td className="p-3 text-gray-600">{dateInfo.dayOfWeek}</td>
                      <td className="p-3">
                        {(times.entry || times.exit) && (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>
                              {times.entry && `כניסה: ${times.entry}`}
                              {times.entry && times.exit && ' • '}
                              {times.exit && `יציאה: ${times.exit}`}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {event.isWorkingDay !== undefined && (
                          <Badge variant={event.isWorkingDay ? "secondary" : "outline"} className="text-xs">
                            {event.isWorkingDay ? 'כן' : 'לא'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
