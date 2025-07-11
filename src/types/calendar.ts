
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'event';
  description?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  business_id: string;
  google_event_id: string;
  google_calendar_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface IsraeliHoliday {
  id: string;
  name: string;
  hebrewName: string;
  date: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות' | 'צום';
  description?: string;
  isWorkingDay: boolean;
}

export interface ShabbatTimes {
  date: string;
  candle_lighting: string;
  havdalah: string;
  torah_portion?: string;
  parsha?: string;
  candleLighting?: string; // For backward compatibility
}
