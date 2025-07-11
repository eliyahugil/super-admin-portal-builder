
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Heart } from 'lucide-react';
import type { IsraeliHoliday } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
        return <Star className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />;
      case 'יום זיכרון':
        return <Heart className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />;
      case 'יום עצמאות':
        return <Star className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />;
      case 'צום':
        return <Calendar className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />;
      default:
        return <Calendar className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />;
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
      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-green-700 font-medium ${className}`}>
        {holidays[0].hebrewName}
      </div>
    );
  }

  // Default badge variant
  return (
    <div className={`space-y-1 ${className}`}>
      {holidays.slice(0, isMobile ? 1 : 2).map((holiday, index) => {
        console.log('🎃 Rendering holiday badge:', holiday.hebrewName);
        return (
          <Badge
            key={`${holiday.date}-${index}`}
            variant="secondary"
            className={`${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs'} border ${getHolidayColor(holiday.type)} flex items-center gap-1`}
          >
            {getHolidayIcon(holiday.type)}
            <span className={isMobile ? 'truncate max-w-[40px]' : ''}>{holiday.hebrewName}</span>
          </Badge>
        );
      })}
      {holidays.length > (isMobile ? 1 : 2) && (
        <Badge variant="secondary" className={`${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs'} bg-gray-100 text-gray-600 border border-gray-200`}>
          +{holidays.length - (isMobile ? 1 : 2)} עוד
        </Badge>
      )}
    </div>
  );
};
