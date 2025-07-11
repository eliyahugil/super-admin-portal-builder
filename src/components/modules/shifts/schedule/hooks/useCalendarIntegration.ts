
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CalendarEvent, GoogleCalendarEvent, IsraeliHoliday, ShabbatTimes } from '@/types/calendar';
import type { ShiftScheduleData, Employee } from '../types';

interface UseCalendarIntegrationParams {
  businessId: string;
  shifts: ShiftScheduleData[];
  employees: Employee[];
}

export const useCalendarIntegration = (params: UseCalendarIntegrationParams) => {
  const { businessId } = params;

  // Mock holidays for now - you can integrate with actual API later
  const { data: holidays = [], isLoading: holidaysLoading } = useQuery({
    queryKey: ['holidays', businessId],
    queryFn: async (): Promise<IsraeliHoliday[]> => {
      // Return empty array for now, can be implemented later
      return [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Mock Shabbat times for now
  const { data: shabbatTimes = [], isLoading: shabbatLoading } = useQuery({
    queryKey: ['shabbat-times', businessId],
    queryFn: async (): Promise<ShabbatTimes[]> => {
      // Return empty array for now, can be implemented later
      return [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Mock calendar events for now
  const { data: calendarEvents = [], isLoading: calendarLoading } = useQuery({
    queryKey: ['calendar-events', businessId],
    queryFn: async (): Promise<CalendarEvent[]> => {
      // Return empty array for now, can be implemented later
      return [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Mock Google events for now
  const { data: googleEvents = [], isLoading: googleLoading } = useQuery({
    queryKey: ['google-events', businessId],
    queryFn: async (): Promise<GoogleCalendarEvent[]> => {
      // Return empty array for now, can be implemented later
      return [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Combine all events
  const combinedEvents = [
    ...calendarEvents,
    ...holidays.map(holiday => ({
      id: `holiday-${holiday.date}`,
      title: holiday.hebrewName || holiday.name || 'חג',
      date: holiday.date,
      type: 'holiday' as const,
      description: holiday.type
    })),
    ...shabbatTimes.map(shabbat => ({
      id: `shabbat-${shabbat.date}`,
      title: `שבת${shabbat.parsha ? ` - פרשת ${shabbat.parsha}` : ''}`,
      date: shabbat.date,
      type: 'event' as const,
      description: `הדלקת נרות: ${shabbat.candleLighting || shabbat.candle_lighting || 'לא זמין'}, הבדלה: ${shabbat.havdalah || 'לא זמין'}`
    }))
  ];

  const loading = holidaysLoading || shabbatLoading || calendarLoading || googleLoading;

  const getEventsForDate = (date: string) => {
    return combinedEvents.filter(event => event.date === date);
  };

  return {
    holidays,
    shabbatTimes,
    calendarEvents,
    googleEvents,
    combinedEvents,
    loading,
    getEventsForDate
  };
};
