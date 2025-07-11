
import { useMemo } from 'react';
import type { IsraeliHoliday, ShabbatTimes } from '@/types/calendar';

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
  const combinedEvents = useMemo(() => {
    const events: CombinedEvent[] = [];
    
    // Add holidays
    holidays.forEach(holiday => {
      events.push({
        id: `holiday-${holiday.date}`,
        date: holiday.date,
        title: holiday.hebrewName || holiday.name,
        type: 'holiday',
        category: holiday.type,
        isWorkingDay: holiday.isWorkingDay,
        data: holiday
      });
    });
    
    // Add Shabbat times
    shabbatTimes.forEach(shabbat => {
      events.push({
        id: `shabbat-${shabbat.date}`,
        date: shabbat.date,
        title: `שבת${shabbat.parsha ? ` - פרשת ${shabbat.parsha}` : ''}`,
        type: 'shabbat',
        category: 'שבת',
        candleLighting: shabbat.candleLighting || shabbat.candle_lighting,
        havdalah: shabbat.havdalah,
        data: shabbat
      });
    });
    
    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays, shabbatTimes]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    holidays.forEach(holiday => types.add(holiday.type));
    if (shabbatTimes.length > 0) {
      types.add('שבת');
    }
    return Array.from(types);
  }, [holidays, shabbatTimes]);

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
    return { entry: null, exit: null };
  };

  return {
    combinedEvents,
    availableTypes,
    holidayTypeCounts,
    getHolidayTimes
  };
};
