
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock } from 'lucide-react';

interface HolidayEvent {
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
  event: HolidayEvent;
  dateInfo: {
    full: string;
    dayOfWeek: string;
  };
  times: {
    entry: string | null;
    exit: string | null;
  };
}

export const HolidayEventCard: React.FC<HolidayEventCardProps> = ({
  event,
  dateInfo,
  times
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
    <Card key={event.id} className="bg-gray-50 border border-gray-200">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header with type and date */}
          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${getTypeColor(event.type, event.category)} flex items-center gap-1`}>
              {getTypeIcon(event.type, event.category)}
              <span>{event.category}</span>
            </Badge>
            <div className="text-left">
              <div className="text-xs font-medium text-gray-900">{dateInfo.full}</div>
              <div className="text-xs text-gray-600">{dateInfo.dayOfWeek}</div>
            </div>
          </div>
          
          {/* Event title */}
          <div className="font-medium text-sm text-gray-900">{event.title}</div>
          
          {/* Times and details */}
          <div className="space-y-1">
            {times.entry && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>כניסה: {times.entry}</span>
              </div>
            )}
            {times.exit && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Star className="h-3 w-3" />
                <span>יציאה: {times.exit}</span>
              </div>
            )}
            
            {event.type === 'holiday' && (
              <Badge 
                variant="secondary" 
                className={`text-xs w-fit ${event.isWorkingDay ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
              >
                {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
