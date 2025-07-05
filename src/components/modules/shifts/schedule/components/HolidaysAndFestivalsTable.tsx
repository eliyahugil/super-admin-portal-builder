
import React, { useState, useMemo } from 'react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';
import { useIsMobile } from '@/hooks/use-mobile';
import { HolidayFilterSection } from './holidays/HolidayFilterSection';
import { HolidayStatsCards } from './holidays/HolidayStatsCards';
import { HolidayMobileEventsList } from './holidays/HolidayMobileEventsList';
import { HolidayDesktopTable } from './holidays/HolidayDesktopTable';
import { useHolidayLogic } from './holidays/useHolidayLogic';

interface HolidaysAndFestivalsTableProps {
  holidays: IsraeliHoliday[];
  shabbatTimes: ShabbatTimes[];
  className?: string;
}

export const HolidaysAndFestivalsTable: React.FC<HolidaysAndFestivalsTableProps> = ({
  holidays,
  shabbatTimes,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const {
    combinedEvents,
    availableTypes,
    holidayTypeCounts,
    getHolidayTimes
  } = useHolidayLogic(holidays, shabbatTimes);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (typeFilter === 'all') return combinedEvents;
    
    if (typeFilter === 'shabbat') {
      return combinedEvents.filter(event => event.type === 'shabbat');
    }
    
    return combinedEvents.filter(event => 
      event.type === 'holiday' && event.category === typeFilter
    );
  }, [combinedEvents, typeFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('he-IL', { weekday: 'long' });
    
    if (isMobile) {
      return {
        full: date.toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'short'
        }),
        dayOfWeek: dayOfWeek
      };
    }
    return {
      full: date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dayOfWeek: dayOfWeek
    };
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className={`space-y-3 p-3 h-full overflow-y-auto ${className}`} dir="rtl">
        <HolidayFilterSection
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          totalEvents={combinedEvents.length}
          shabbatCount={shabbatTimes.length}
          availableTypes={availableTypes}
          holidayTypeCounts={holidayTypeCounts}
          isMobile={true}
        />

        <HolidayStatsCards
          holidayTypeCounts={holidayTypeCounts}
          shabbatCount={shabbatTimes.length}
          filteredEventsCount={filteredEvents.length}
          isMobile={true}
        />

        <HolidayMobileEventsList
          filteredEvents={filteredEvents}
          typeFilter={typeFilter}
          shabbatTimes={shabbatTimes}
          formatDate={formatDate}
          getHolidayTimes={getHolidayTimes}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      <HolidayFilterSection
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalEvents={combinedEvents.length}
        shabbatCount={shabbatTimes.length}
        availableTypes={availableTypes}
        holidayTypeCounts={holidayTypeCounts}
        isMobile={false}
      />

      <HolidayStatsCards
        holidayTypeCounts={holidayTypeCounts}
        shabbatCount={shabbatTimes.length}
        filteredEventsCount={filteredEvents.length}
        isMobile={false}
      />

      <HolidayDesktopTable
        filteredEvents={filteredEvents}
        typeFilter={typeFilter}
        formatDate={formatDate}
        getHolidayTimes={getHolidayTimes}
      />
    </div>
  );
};
