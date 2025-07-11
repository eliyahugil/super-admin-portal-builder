
import React from 'react';
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
  const getEventIcon = () => {
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

  const getEventColor = () => {
    if (event.type === 'shabbat') {
      return 'bg-purple-50 border-purple-200';
    }
    
    switch (event.category) {
      case 'חג':
        return 'bg-green-50 border-green-200';
      case 'מועד':
        return 'bg-blue-50 border-blue-200';
      case 'יום זיכרון':
        return 'bg-gray-50 border-gray-200';
      case 'יום עצמאות':
        return 'bg-blue-50 border-blue-200';
      case 'צום':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getEventColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {getEventIcon()}
          <h4 className="font-medium text-sm truncate">{event.title}</h4>
        </div>
        <Badge variant="secondary" className="text-xs">
          {event.type === 'shabbat' ? 'שבת' : event.category}
        </Badge>
      </div>
      
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium">{dateInfo.dayOfWeek}</span>
          <span>{dateInfo.full}</span>
        </div>
        
        {(times.entry || times.exit) && (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              {times.entry && `כניסה: ${times.entry}`}
              {times.entry && times.exit && ' • '}
              {times.exit && `יציאה: ${times.exit}`}
            </span>
          </div>
        )}
        
        {event.isWorkingDay !== undefined && (
          <div className="text-xs">
            <Badge variant={event.isWorkingDay ? "secondary" : "outline"} className="text-xs">
              {event.isWorkingDay ? 'יום עבודה' : 'יום חופש'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
