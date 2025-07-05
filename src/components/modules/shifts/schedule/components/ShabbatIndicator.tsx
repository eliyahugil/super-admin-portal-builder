
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';

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
  const isShabbat = date.getDay() === 6; // Saturday
  const isFriday = date.getDay() === 5; // Friday
  
  console.log('🕯️ ShabbatIndicator rendered:', { 
    hasShabbatTimes: !!shabbatTimes, 
    isShabbat, 
    isFriday, 
    variant,
    shabbatTimes 
  });

  // אם אין נתוני שבת ואין זה יום שישי או שבת, אל תציג כלום
  if (!shabbatTimes && !isShabbat && !isFriday) {
    return null;
  }

  if (variant === 'text') {
    return (
      <div className={`text-xs text-purple-700 font-medium ${className}`}>
        {isFriday && shabbatTimes?.candleLighting && (
          <div className="flex items-center gap-1">
            🕯️ הדלקת נרות: {shabbatTimes.candleLighting}
          </div>
        )}
        {isShabbat && shabbatTimes?.havdalah && (
          <div className="flex items-center gap-1">
            ⭐ צאת שבת: {shabbatTimes.havdalah}
          </div>
        )}
        {isShabbat && !shabbatTimes?.havdalah && (
          <div className="flex items-center gap-1">
            🕯️ שבת
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-1 ${className}`}>
        {isFriday && shabbatTimes?.candleLighting && (
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            הדלקת נרות: {shabbatTimes.candleLighting}
          </Badge>
        )}
        {isShabbat && shabbatTimes?.havdalah && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Star className="h-3 w-3" />
            צאת שבת: {shabbatTimes.havdalah}
          </Badge>
        )}
        {isShabbat && !shabbatTimes?.havdalah && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Star className="h-3 w-3" />
            שבת
          </Badge>
        )}
        {shabbatTimes?.parsha && (
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
            פרשת {shabbatTimes.parsha}
          </Badge>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <div className={`space-y-1 ${className}`}>
      {isFriday && shabbatTimes?.candleLighting && (
        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {shabbatTimes.candleLighting}
        </Badge>
      )}
      {isShabbat && shabbatTimes?.havdalah && (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
          <Star className="h-3 w-3" />
          {shabbatTimes.havdalah}
        </Badge>
      )}
      {isShabbat && !shabbatTimes?.havdalah && (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
          <Star className="h-3 w-3" />
          שבת
        </Badge>
      )}
      {shabbatTimes?.parsha && (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
          פרשת {shabbatTimes.parsha}
        </Badge>
      )}
    </div>
  );
};
