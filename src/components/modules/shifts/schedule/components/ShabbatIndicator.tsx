
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';
import { ShabbatTimes } from '@/hooks/useShabbatTimes';

interface ShabbatIndicatorProps {
  shabbatTimes: ShabbatTimes | null;
  date: Date;
  variant?: 'badge' | 'text' | 'detailed';
  className?: string;
}

export const ShabbatIndicator: React.FC<ShabbatIndicatorProps> = ({
  shabbatTimes,
  date,
  variant = 'badge',
  className = ''
}) => {
  const isShabbat = date.getDay() === 6;
  const isFriday = date.getDay() === 5;
  
  if (!shabbatTimes && !isShabbat && !isFriday) return null;

  if (variant === 'text') {
    return (
      <div className={`text-xs text-purple-700 font-medium ${className}`}>
        {isShabbat && '🕯️ שבת'}
        {isFriday && shabbatTimes?.candleLighting && `🕯️ ${shabbatTimes.candleLighting}`}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-1 ${className}`}>
        {isFriday && shabbatTimes?.candleLighting && (
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
            <Clock className="h-3 w-3 mr-1" />
            הדלקת נרות: {shabbatTimes.candleLighting}
          </Badge>
        )}
        {isShabbat && shabbatTimes?.havdalah && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            הבדלה: {shabbatTimes.havdalah}
          </Badge>
        )}
        {shabbatTimes?.parsha && (
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
            פרשת {shabbatTimes.parsha}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {isFriday && shabbatTimes?.candleLighting && (
        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
          <Clock className="h-3 w-3 mr-1" />
          {shabbatTimes.candleLighting}
        </Badge>
      )}
      {isShabbat && (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          <Star className="h-3 w-3 mr-1" />
          שבת
        </Badge>
      )}
    </div>
  );
};
