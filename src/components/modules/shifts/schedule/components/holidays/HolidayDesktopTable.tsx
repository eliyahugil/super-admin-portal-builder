
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

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
  const getEventBadgeColor = (event: CombinedEvent) => {
    if (event.type === 'shabbat') return 'default';
    if (event.category === 'חג') return 'default';
    if (event.category === 'יום עצמאות') return 'default';
    if (event.category === 'יום זיכרון') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {typeFilter === 'all' ? 'כל האירועים' : `${typeFilter} (${filteredEvents.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין אירועים</h3>
            <p className="text-gray-600">אין אירועים מסוג זה</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם האירוע
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סוג
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    זמנים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס עבודה
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  const times = getHolidayTimes(event);
                  
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{dateInfo.full}</div>
                          <div className="text-gray-500">{dateInfo.dayOfWeek}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getEventBadgeColor(event)}>
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {times.entry || times.exit ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <div>
                              {times.entry && <div>כניסה: {times.entry}</div>}
                              {times.exit && <div>יציאה: {times.exit}</div>}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.isWorkingDay !== undefined && (
                          <Badge variant={event.isWorkingDay ? "outline" : "secondary"}>
                            {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
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
