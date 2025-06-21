
import { useEffect, useState } from 'react';
import { DataSummary } from './types';
import { GoogleCalendarEvent, GoogleCalendarIntegration } from '@/hooks/useGoogleCalendar';

export function useDataSummary(
  events: GoogleCalendarEvent[], 
  integrations: GoogleCalendarIntegration[]
) {
  const [dataSummary, setDataSummary] = useState<DataSummary>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalContacts: 0,
    filesStored: 0,
    emailsSent: 0,
    lastSyncTime: ''
  });

  useEffect(() => {
    const now = new Date();
    const upcomingEvents = events.filter(event => 
      new Date(event.start_time) > now
    ).length;

    setDataSummary({
      totalEvents: events.length,
      upcomingEvents,
      totalContacts: 0, // Will be implemented when contacts API is ready
      filesStored: 0, // Will be implemented when Drive API is ready
      emailsSent: 0, // Will be implemented when Gmail API is ready
      lastSyncTime: integrations.length > 0 
        ? integrations[0].last_sync_at || 'אף פעם' 
        : 'אף פעם'
    });
  }, [events, integrations]);

  return dataSummary;
}
