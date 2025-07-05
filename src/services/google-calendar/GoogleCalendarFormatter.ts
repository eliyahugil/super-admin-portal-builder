export interface HebrewCalendarConfig {
  primaryCalendar: 'hebrew' | 'gregorian';
  showHebrewDates: boolean;
  showJewishHolidays: boolean;
  timeZone: string;
}

export interface FormattedCalendarDay {
  gregorianDate: Date;
  hebrewDate?: string;
  hebrewDayName: string;
  gregorianDayName: string;
  isJewishHoliday: boolean;
  holidayName?: string;
  isShabbat: boolean;
  isFriday: boolean;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

export class GoogleCalendarFormatter {
  private config: HebrewCalendarConfig;

  constructor(config: HebrewCalendarConfig = {
    primaryCalendar: 'gregorian',
    showHebrewDates: true,
    showJewishHolidays: true,
    timeZone: 'Asia/Jerusalem'
  }) {
    this.config = config;
  }

  // Hebrew day names (Sunday to Saturday) - ordered for RTL display
  private hebrewDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  private hebrewDayNamesShort = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  formatCalendarDay(date: Date): FormattedCalendarDay {
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const isShabbat = dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;

    return {
      gregorianDate: date,
      hebrewDayName: this.hebrewDayNames[dayOfWeek],
      gregorianDayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isJewishHoliday: false, // Will be enhanced with actual holiday data
      isShabbat,
      isFriday,
      dayOfWeek
    };
  }

  getWeekDaysHeader(format: 'full' | 'short' = 'short'): string[] {
    // Hebrew calendar starts with Sunday and is displayed RTL
    const names = format === 'short' ? this.hebrewDayNamesShort : this.hebrewDayNames;
    // For RTL Hebrew display, we need to reverse the order so Sunday appears on the right
    return names.slice().reverse();
  }

  getMonthCalendar(year: number, month: number): FormattedCalendarDay[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const calendar: FormattedCalendarDay[][] = [];
    let currentWeek: FormattedCalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDate = new Date(year, month, -(firstDayOfWeek - 1 - i));
      currentWeek.push(this.formatCalendarDay(emptyDate));
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentWeek.push(this.formatCalendarDay(date));

      // If we've filled a week (7 days), start a new week
      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add empty cells for days after the last day of the month
    while (currentWeek.length < 7) {
      const nextMonthDay = currentWeek.length - firstDayOfWeek + daysInMonth + 1;
      const emptyDate = new Date(year, month + 1, nextMonthDay - daysInMonth);
      currentWeek.push(this.formatCalendarDay(emptyDate));
    }

    if (currentWeek.length > 0) {
      calendar.push(currentWeek);
    }

    return calendar;
  }

  getYearCalendar(year: number): Array<{
    month: number;
    name: string;
    hebrewName: string;
    days: FormattedCalendarDay[];
    firstDayOfWeek: number;
  }> {
    const months = [];
    const hebrewMonthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();

      const days: FormattedCalendarDay[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push(this.formatCalendarDay(date));
      }

      months.push({
        month,
        name: firstDay.toLocaleDateString('en-US', { month: 'long' }),
        hebrewName: hebrewMonthNames[month],
        days,
        firstDayOfWeek
      });
    }

    return months;
  }

  formatTimeForDisplay(time: string, use24Hour: boolean = true): string {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    
    if (use24Hour) {
      return `${hours}:${minutes}`;
    }
    
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }
}
