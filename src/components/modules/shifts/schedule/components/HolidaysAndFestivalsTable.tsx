
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

  console.log('🎊 HolidaysAndFestivalsTable - Input data:', {
    holidaysCount: holidays.length,
    shabbatTimesCount: shabbatTimes.length,
    isMobile,
    typeFilter
  });

  const {
    combinedEvents,
    availableTypes,
    holidayTypeCounts,
    getHolidayTimes
  } = useHolidayLogic(holidays, shabbatTimes);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    console.log('🔍 Filtering events with filter:', typeFilter);
    
    if (typeFilter === 'all') {
      console.log('📋 Returning all combined events:', combinedEvents.length);
      return combinedEvents;
    }
    
    if (typeFilter === 'shabbat') {
      const shabbatEvents = combinedEvents.filter(event => event.type === 'shabbat');
      console.log('🕯️ Filtered Shabbat events:', shabbatEvents.length);
      return shabbatEvents;
    }
    
    const categoryEvents = combinedEvents.filter(event => 
      event.type === 'holiday' && event.category === typeFilter
    );
    console.log('🎃 Filtered category events for', typeFilter, ':', categoryEvents.length);
    return categoryEvents;
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

  // Show loading or empty state if no data
  if (holidays.length === 0 && shabbatTimes.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 mb-2">טוען נתוני חגים ושבתות...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log('🎊 Rendering with data:', {
    combinedEventsCount: combinedEvents.length,
    filteredEventsCount: filteredEvents.length,
    availableTypesCount: availableTypes.length
  });

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
