
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star } from 'lucide-react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidays';

interface HolidayIndicatorProps {
  holidays: IsraeliHoliday[];
  variant?: 'badge' | 'text' | 'icon';
  className?: string;
}

export const HolidayIndicator: React.FC<HolidayIndicatorProps> = ({
  holidays,
  variant = 'badge',
  className = ''
}) => {
  if (holidays.length === 0) return null;

  const getHolidayColor = (type: IsraeliHoliday['type']) => {
    switch (type) {
      case 'חג':
        return 'bg-green-100 text-green-800';
      case 'מועד':
        return 'bg-blue-100 text-blue-800';
      case 'יום זיכרון':
        return 'bg-gray-100 text-gray-800';
      case 'יום עצמאות':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getHolidayIcon = (type: IsraeliHoliday['type']) => {
    switch (type) {
      case 'חג':
      case 'מועד':
        return <Star className="h-3 w-3" />;
      case 'יום זיכרון':
        return <Calendar className="h-3 w-3" />;
      case 'יום עצמאות':
        return <Star className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        {getHolidayIcon(holidays[0].type)}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`text-xs text-green-700 font-medium ${className}`}>
        {holidays[0].hebrewName}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {holidays.slice(0, 2).map((holiday, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={`text-xs ${getHolidayColor(holiday.type)}`}
        >
          {getHolidayIcon(holiday.type)}
          <span className="mr-1">{holiday.hebrewName}</span>
        </Badge>
      ))}
      {holidays.length > 2 && (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
          +{holidays.length - 2} עוד
        </Badge>
      )}
    </div>
  );
};
