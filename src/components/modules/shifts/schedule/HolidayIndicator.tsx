
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Heart } from 'lucide-react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';

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
  console.log('🎃 HolidayIndicator rendered with:', { holidaysCount: holidays.length, variant });

  if (!holidays || holidays.length === 0) {
    console.log('🎃 No holidays to display');
    return null;
  }

  const getHolidayColor = (type: IsraeliHoliday['type']) => {
    switch (type) {
      case 'חג':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'מועד':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'יום זיכרון':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'יום עצמאות':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'צום':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getHolidayIcon = (type: IsraeliHoliday['type']) => {
    switch (type) {
      case 'חג':
      case 'מועד':
        return <Star className="h-3 w-3" />;
      case 'יום זיכרון':
        return <Heart className="h-3 w-3" />;
      case 'יום עצמאות':
        return <Star className="h-3 w-3" />;
      case 'צום':
        return <Calendar className="h-3 w-3" />;
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

  // Default badge variant
  return (
    <div className={`space-y-1 ${className}`}>
      {holidays.slice(0, 2).map((holiday, index) => {
        console.log('🎃 Rendering holiday badge:', holiday.hebrewName);
        return (
          <Badge
            key={`${holiday.date}-${index}`}
            variant="secondary"
            className={`text-xs border ${getHolidayColor(holiday.type)} flex items-center gap-1`}
          >
            {getHolidayIcon(holiday.type)}
            <span>{holiday.hebrewName}</span>
          </Badge>
        );
      })}
      {holidays.length > 2 && (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border border-gray-200">
          +{holidays.length - 2} עוד
        </Badge>
      )}
    </div>
  );
};
