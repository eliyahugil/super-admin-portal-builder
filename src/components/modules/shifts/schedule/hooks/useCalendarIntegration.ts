
import { useMemo } from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useIsraeliHolidaysFromHebcal } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { useShabbatTimesFromHebcal } from '@/hooks/useShabbatTimesFromHebcal';
import { CalendarEvent, ShiftScheduleData, Employee } from '../types';

interface UseCalendarIntegrationProps {
  businessId: string;
  shifts: ShiftScheduleData[];
  employees: Employee[];
}

export const useCalendarIntegration = ({ 
  businessId, 
  shifts, 
  employees 
}: UseCalendarIntegrationProps) => {
  const { events: googleEvents, loading: googleLoading } = useGoogleCalendar(businessId);
  const { holidays, isLoading: holidaysLoading } = useIsraeliHolidaysFromHebcal();
  const { shabbatTimes, isLoading: shabbatLoading } = useShabbatTimesFromHebcal();

  const combinedEvents = useMemo((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add shifts
    shifts.forEach(shift => {
      const employee = employees.find(emp => emp.id === shift.employee_id);
      events.push({
        id: `shift-${shift.id}`,
        title: employee ? `${employee.first_name} ${employee.last_name}` : 'משמרת',
        date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        type: 'shift',
        source: 'internal',
        data: shift,
        color: '#3b82f6'
      });
    });

    // Add holidays
    holidays.forEach(holiday => {
      events.push({
        id: `holiday-${holiday.date}`,
        title: holiday.hebrewName,
        date: holiday.date,
        type: 'holiday',
        source: 'holiday',
        data: holiday,
        color: holiday.type === 'חג' ? '#10b981' : '#6366f1',
        isWorkingDay: holiday.isWorkingDay
      });
    });

    // Add Shabbat times
    shabbatTimes.forEach(shabbat => {
      if (shabbat.candleLighting || shabbat.havdalah) {
        events.push({
          id: `shabbat-${shabbat.date}`,
          title: `שבת${shabbat.parsha ? ` - פרשת ${shabbat.parsha}` : ''}`,
          date: shabbat.date,
          start_time: shabbat.candleLighting,
          end_time: shabbat.havdalah,
          type: 'shabbat',
          source: 'shabbat',
          data: shabbat,
          color: '#8b5cf6',
          isWorkingDay: false
        });
      }
    });

    // Add Google Calendar events
    googleEvents.forEach(event => {
      events.push({
        id: `google-${event.id}`,
        title: event.title,
        date: event.start_time.split('T')[0],
        start_time: new Date(event.start_time).toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        end_time: new Date(event.end_time).toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'google_calendar',
        source: 'google',
        data: event,
        color: '#f59e0b'
      });
    });

    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts, employees, holidays, shabbatTimes, googleEvents]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return combinedEvents.filter(event => event.date === dateStr);
  };

  const getEventsForDateRange = (startDate: Date, endDate: Date): CalendarEvent[] => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return combinedEvents.filter(event => event.date >= start && event.date <= end);
  };

  return {
    combinedEvents,
    googleEvents,
    holidays,
    shabbatTimes,
    loading: googleLoading || holidaysLoading || shabbatLoading,
    getEventsForDate,
    getEventsForDateRange
  };
};
