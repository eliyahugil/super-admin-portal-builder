
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Candle } from 'lucide-react';
import type { ShabbatTimes } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShabbatIndicatorProps {
  shabbatTimes: ShabbatTimes;
  date: Date;
  variant?: 'badge' | 'text' | 'icon';
  className?: string;
}

export const ShabbatIndicator: React.FC<ShabbatIndicatorProps> = ({
  shabbatTimes,
  date,
  variant = 'badge',
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  if (!shabbatTimes) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <Candle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-purple-600`} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-purple-700 font-medium ${className}`}>
        שבת {shabbatTimes.parsha && `- פרשת ${shabbatTimes.parsha}`}
      </div>
    );
  }

  // Default badge variant
  return (
    <Badge
      variant="secondary"
      className={`${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs'} border bg-purple-50 text-purple-800 border-purple-200 flex items-center gap-1 ${className}`}
    >
      <Candle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
      <span className={isMobile ? 'truncate max-w-[40px]' : ''}>
        שבת {shabbatTimes.parsha && `- ${shabbatTimes.parsha}`}
      </span>
    </Badge>
  );
};
