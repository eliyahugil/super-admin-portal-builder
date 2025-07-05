
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Star, Clock } from 'lucide-react';

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
  const getTypeColor = (type: string, category: string) => {
    if (type === 'shabbat') return 'bg-purple-100 text-purple-800';
    
    switch (category) {
      case 'חג': return 'bg-green-100 text-green-800';
      case 'מועד': return 'bg-blue-100 text-blue-800';
      case 'יום זיכרון': return 'bg-gray-100 text-gray-800';
      case 'יום עצמאות': return 'bg-blue-100 text-blue-800';
      case 'צום': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string, category: string) => {
    if (type === 'shabbat') return <Star className="h-3 w-3" />;
    
    switch (category) {
      case 'חג':
      case 'מועד':
        return <Star className="h-3 w-3" />;
      case 'יום זיכרון':
      case 'יום עצמאות':
      case 'צום':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
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
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">יום</TableHead>
                  <TableHead className="text-right">אירוע</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">שעות</TableHead>
                  <TableHead className="text-right">פרטים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  const times = getHolidayTimes(event);
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {dateInfo.full}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {dateInfo.dayOfWeek}
                      </TableCell>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(event.type, event.category)}>
                          {getTypeIcon(event.type, event.category)}
                          <span className="mr-1">{event.category}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {times.entry && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>כניסה: {times.entry}</span>
                            </div>
                          )}
                          {times.exit && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>יציאה: {times.exit}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.type === 'holiday' && (
                          <Badge 
                            variant="secondary" 
                            className={event.isWorkingDay ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                          >
                            {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
