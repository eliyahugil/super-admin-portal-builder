
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  date: string;
  name: string;
  hebrewName: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות' | 'צום';
  isWorkingDay: boolean;
  category: string;
  subCategory?: string;
  isYomTov?: boolean;
  link?: string;
  memo?: string;
}

interface HebcalResponse {
  title: string;
  date: string;
  location?: {
    title: string;
    city: string;
    tzid: string;
    latitude: number;
    longitude: number;
    cc: string;
    country: string;
  };
  range: {
    start: string;
    end: string;
  };
  items: Array<{
    title: string;
    date: string;
    hdate?: string;
    category: string;
    subcat?: string;
    yomtov?: boolean;
    hebrew?: string;
    link?: string;
    memo?: string;
  }>;
}

const fetchIsraeliHolidaysFromHebcal = async (): Promise<IsraeliHoliday[]> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Build Hebcal.com API URL for Israel with comprehensive holiday data
    const params = new URLSearchParams({
      v: '1',
      cfg: 'json',
      year: currentYear.toString(),
      i: 'on', // Israel holidays and Torah readings
      maj: 'on', // Major holidays
      min: 'on', // Minor holidays
      mod: 'on', // Modern holidays (Yom HaShoah, Yom Ha'atzmaut, etc.)
      nx: 'on', // Rosh Chodesh
      mf: 'on', // Minor fasts
      ss: 'on', // Special Shabbatot
      c: 'on', // Candle lighting times
      M: 'on', // Havdalah
      geo: 'geonameid',
      geonameid: '294640', // Jerusalem, Israel
      lg: 'h', // Hebrew language for event titles
    });

    const url = `https://www.hebcal.com/hebcal?${params.toString()}`;
    
    console.log('🔍 Fetching holidays from Hebcal.com:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Hebcal API request failed: ${response.status}`);
    }
    
    const data: HebcalResponse = await response.json();
    
    console.log(`📅 Received ${data.items?.length || 0} items from Hebcal.com`);
    
    if (!data.items || data.items.length === 0) {
      console.warn('No items received from Hebcal API');
      return [];
    }

    // Filter and transform holiday data
    const holidays = data.items
      .filter(item => {
        // Include only actual holidays, exclude candle lighting and havdalah times
        return item.category === 'holiday' || 
               item.category === 'roshchodesh' ||
               item.category === 'modern' ||
               item.category === 'minor' ||
               (item.category === 'fast' && item.subcat !== 'modern');
      })
      .map(item => {
        // Parse date to ensure proper format
        let dateStr = item.date;
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
        }
        
        return {
          date: dateStr,
          name: item.title || '',
          hebrewName: item.hebrew || item.title || '',
          type: mapHolidayType(item.category, item.subcat),
          isWorkingDay: !item.yomtov, // Yom Tov means no work
          category: item.category,
          subCategory: item.subcat,
          isYomTov: item.yomtov || false,
          link: item.link,
          memo: item.memo
        };
      })
      .filter(holiday => holiday.date && holiday.hebrewName);

    console.log(`✅ Successfully parsed ${holidays.length} holidays from Hebcal.com`);
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays from Hebcal.com:', error);
    return [];
  }
};

const mapHolidayType = (category: string, subCategory?: string): IsraeliHoliday['type'] => {
  if (category === 'holiday') {
    if (subCategory === 'major') return 'חג';
    if (subCategory === 'minor') return 'מועד';
    return 'חג';
  }
  
  if (category === 'modern') {
    if (subCategory === 'memorial') return 'יום זיכרון';
    return 'יום עצמאות';
  }
  
  if (category === 'fast') return 'צום';
  if (category === 'roshchodesh') return 'מועד';
  if (category === 'minor') return 'מועד';
  
  return 'חג';
};

export const useIsraeliHolidaysFromHebcal = () => {
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ['israeli-holidays-hebcal'],
    queryFn: fetchIsraeliHolidaysFromHebcal,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in memory for 7 days
    retry: 2,
  });

  const getHolidaysForDate = (date: Date): IsraeliHoliday[] => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getHolidaysForMonth = (year: number, month: number): IsraeliHoliday[] => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() === month;
    });
  };

  const isHoliday = (date: Date): boolean => {
    return getHolidaysForDate(date).length > 0;
  };

  const isWorkingDay = (date: Date): boolean => {
    const holidaysForDate = getHolidaysForDate(date);
    if (holidaysForDate.length === 0) return true;
    return holidaysForDate.some(h => h.isWorkingDay);
  };

  return {
    holidays,
    isLoading,
    error,
    getHolidaysForDate,
    getHolidaysForMonth,
    isHoliday,
    isWorkingDay
  };
};
