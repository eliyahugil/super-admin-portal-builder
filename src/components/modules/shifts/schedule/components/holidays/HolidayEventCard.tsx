
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface HolidayEventCardProps {
  event: CombinedEvent;
  dateInfo: { full: string; dayOfWeek: string };
  times: { entry: string | null; exit: string | null };
}

export const HolidayEventCard: React.FC<HolidayEventCardProps> = ({
  event,
  dateInfo,
  times
}) => {
  const getEventColor = (event: CombinedEvent) => {
    if (event.type === 'shabbat') return 'bg-purple-50 border-purple-200';
    if (event.category === 'חג') return 'bg-green-50 border-green-200';
    if (event.category === 'יום עצמאות') return 'bg-blue-50 border-blue-200';
    if (event.category === 'יום זיכרון') return 'bg-gray-50 border-gray-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getEventBadgeColor = (event: CombinedEvent) => {
    if (event.type === 'shabbat') return 'default';
    if (event.category === 'חג') return 'default';
    if (event.category === 'יום עצמאות') return 'default';
    if (event.category === 'יום זיכרון') return 'secondary';
    return 'outline';
  };

  return (
    <Card className={`${getEventColor(event)} hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{event.title}</h3>
            <Badge variant={getEventBadgeColor(event)} className="text-xs">
              {event.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{dateInfo.full}</span>
            <span>({dateInfo.dayOfWeek})</span>
          </div>

          {(times.entry || times.exit) && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              {times.entry && <span>כניסה: {times.entry}</span>}
              {times.exit && <span>יציאה: {times.exit}</span>}
            </div>
          )}

          {event.isWorkingDay !== undefined && (
            <div className="text-xs">
              <Badge variant={event.isWorkingDay ? "outline" : "secondary"}>
                {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
