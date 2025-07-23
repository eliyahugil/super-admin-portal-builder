
import { useState } from 'react';
import type { CalendarEvent } from '@/types/calendar';

export const useCalendarEvents = (businessId?: string | null) => {
  const [events] = useState<CalendarEvent[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    events,
    isLoading,
    error,
    refetch: () => Promise.resolve()
  };
};
