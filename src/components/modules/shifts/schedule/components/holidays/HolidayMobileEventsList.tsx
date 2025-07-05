
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { HolidayEventCard } from './HolidayEventCard';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';

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

interface HolidayMobileEventsListProps {
  filteredEvents: CombinedEvent[];
  typeFilter: string;
  shabbatTimes: ShabbatTimes[];
  formatDate: (dateStr: string) => { full: string; dayOfWeek: string };
  getHolidayTimes: (event: CombinedEvent) => { entry: string | null; exit: string | null };
}

export const HolidayMobileEventsList: React.FC<HolidayMobileEventsListProps> = ({
  filteredEvents,
  typeFilter,
  formatDate,
  getHolidayTimes
}) => {
  return (
    <Card className="flex-1 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {typeFilter === 'all' ? 'כל האירועים' : `${typeFilter} (${filteredEvents.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 px-3">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">אין אירועים מסוג זה</p>
          </div>
        ) : (
          <div className="space-y-1 px-3 pb-3">
            {filteredEvents.map((event) => {
              const dateInfo = formatDate(event.date);
              const times = getHolidayTimes(event);
              
              return (
                <HolidayEventCard
                  key={event.id}
                  event={event}
                  dateInfo={dateInfo}
                  times={times}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
