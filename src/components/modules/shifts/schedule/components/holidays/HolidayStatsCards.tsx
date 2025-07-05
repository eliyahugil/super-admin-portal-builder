
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar } from 'lucide-react';

interface HolidayStatsCardsProps {
  holidayTypeCounts: Record<string, number>;
  shabbatCount: number;
  filteredEventsCount: number;
  isMobile?: boolean;
}

export const HolidayStatsCards: React.FC<HolidayStatsCardsProps> = ({
  holidayTypeCounts,
  shabbatCount,
  filteredEventsCount,
  isMobile = false
}) => {
  const statsData = [
    {
      icon: Star,
      value: holidayTypeCounts['חג'] || 0,
      label: 'חגים',
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      value: holidayTypeCounts['מועד'] || 0,
      label: 'מועדים',
      color: 'text-blue-600'
    },
    {
      icon: Star,
      value: shabbatCount,
      label: 'שבתות',
      color: 'text-purple-600'
    },
    {
      icon: Calendar,
      value: filteredEventsCount,
      label: 'מוצגים',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
      {statsData.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className="flex items-center gap-2">
              <stat.icon className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} ${stat.color}`} />
              <div className={isMobile ? 'text-right' : ''}>
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
