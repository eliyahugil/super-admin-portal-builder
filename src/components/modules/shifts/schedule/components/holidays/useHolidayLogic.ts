
import { useMemo } from 'react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';

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

export const useHolidayLogic = (holidays: IsraeliHoliday[], shabbatTimes: ShabbatTimes[]) => {
  const combinedEvents = useMemo((): CombinedEvent[] => {
    const events = [
      ...holidays.map(holiday => ({
        id: `holiday-${holiday.date}`,
        date: holiday.date,
        title: holiday.hebrewName,
        type: 'holiday' as const,
        category: holiday.type,
        isWorkingDay: holiday.isWorkingDay,
        data: holiday
      })),
      ...shabbatTimes.map(shabbat => ({
        id: `shabbat-${shabbat.date}`,
        date: shabbat.date,
        title: `שבת${shabbat.parsha ? ` - פרשת ${shabbat.parsha}` : ''}`,
        type: 'shabbat' as const,
        category: 'שבת',
        isWorkingDay: false,
        candleLighting: shabbat.candleLighting,
        havdalah: shabbat.havdalah,
        data: shabbat
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [holidays, shabbatTimes]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('שבת');
    holidays.forEach(holiday => types.add(holiday.type));
    return Array.from(types).sort();
  }, [holidays]);

  const holidayTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    holidays.forEach(holiday => {
      counts[holiday.type] = (counts[holiday.type] || 0) + 1;
    });
    return counts;
  }, [holidays]);

  const getHolidayTimes = (event: CombinedEvent) => {
    if (event.type === 'shabbat') {
      return {
        entry: event.candleLighting || null,
        exit: event.havdalah || null
      };
    }
    
    // For holidays, find nearby Shabbat times for reference
    const eventDate = new Date(event.date);
    const nearbyShabbat = shabbatTimes.find(s => 
      Math.abs(new Date(s.date).getTime() - eventDate.getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    
    return {
      entry: nearbyShabbat?.candleLighting || null,
      exit: nearbyShabbat?.havdalah || null
    };
  };

  return {
    combinedEvents,
    availableTypes,
    holidayTypeCounts,
    getHolidayTimes
  };
};
