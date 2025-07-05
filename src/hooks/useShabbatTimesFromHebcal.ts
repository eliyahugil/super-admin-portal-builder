
import { useQuery } from '@tanstack/react-query';

export interface ShabbatTimes {
  date: string;
  candleLighting: string;
  havdalah: string;
  parsha: string;
  location: string;
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
    hebrew?: string;
    memo?: string;
    title_orig?: string;
  }>;
}

const fetchShabbatTimesFromHebcal = async (): Promise<ShabbatTimes[]> => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Get data for current and next month to ensure we have upcoming Shabbat times
    const months = [currentMonth, currentMonth + 1].map(month => {
      const adjustedMonth = month > 12 ? month - 12 : month;
      const adjustedYear = month > 12 ? currentYear + 1 : currentYear;
      return { year: adjustedYear, month: adjustedMonth };
    });

    let allShabbatTimes: ShabbatTimes[] = [];

    for (const { year, month } of months) {
      // Build Hebcal.com API URL for Israel with candle lighting and havdalah times
      const params = new URLSearchParams({
        v: '1',
        cfg: 'json',
        year: year.toString(),
        month: month.toString(),
        i: 'on', // Israel
        c: 'on', // Candle lighting times
        M: 'on', // Havdalah times
        s: 'on', // Parsha (Torah reading)
        geo: 'geonameid',
        geonameid: '294640', // Jerusalem, Israel
        b: '40', // Jerusalem - 40 minutes before sunset for candle lighting
      });

      const url = `https://www.hebcal.com/hebcal?${params.toString()}`;
      
      console.log(`🔍 Fetching Shabbat times from Hebcal.com for ${year}-${month}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch Shabbat times: ${response.status}`);
        continue;
      }
      
      const data: HebcalResponse = await response.json();
      
      console.log(`🕯️ Received ${data.items?.length || 0} items from Hebcal.com for ${year}-${month}`);
      
      if (!data.items || data.items.length === 0) {
        continue;
      }

      // Group items by date to combine candle lighting, havdalah, and parsha
      const itemsByDate: { [key: string]: any[] } = {};
      
      data.items.forEach(item => {
        let dateStr = item.date;
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
        }
        
        if (!itemsByDate[dateStr]) {
          itemsByDate[dateStr] = [];
        }
        itemsByDate[dateStr].push(item);
      });

      // Process each date and extract Shabbat-related information
      Object.entries(itemsByDate).forEach(([dateStr, items]) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        
        // Look for Friday (candle lighting) and Saturday (havdalah, parsha)
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
          let candleLighting = '';
          let havdalah = '';
          let parsha = '';
          
          items.forEach(item => {
            if (item.category === 'candles') {
              // Extract time from title like "Candle lighting: 17:11"
              const timeMatch = item.title.match(/(\d{1,2}:\d{2})/);
              if (timeMatch) {
                if (dayOfWeek === 5) { // Friday
                  candleLighting = timeMatch[1];
                } else if (dayOfWeek === 6) { // Saturday
                  candleLighting = timeMatch[1];
                }
              }
            } else if (item.category === 'havdalah') {
              // Extract time from title like "Havdalah: 18:05"
              const timeMatch = item.title.match(/(\d{1,2}:\d{2})/);
              if (timeMatch) {
                havdalah = timeMatch[1];
              }
            } else if (item.category === 'parashat') {
              // Get parsha name
              parsha = item.hebrew || item.title.replace('Parashat ', '').replace('פרשת ', '');
            }
          });
          
          // Create entry if we have meaningful data
          if (candleLighting || havdalah || parsha) {
            allShabbatTimes.push({
              date: dateStr,
              candleLighting: candleLighting,
              havdalah: havdalah,
              parsha: parsha,
              location: data.location?.city || 'ירושלים'
            });
          }
        }
      });
    }
    
    // Remove duplicates and sort by date
    const uniqueShabbatTimes = allShabbatTimes.filter((times, index, self) => 
      index === self.findIndex(t => t.date === times.date)
    ).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`🕯️ Final result: ${uniqueShabbatTimes.length} unique Shabbat times from Hebcal.com`);
    return uniqueShabbatTimes;
  } catch (error) {
    console.error('Error fetching Shabbat times from Hebcal.com:', error);
    return [];
  }
};

export const useShabbatTimesFromHebcal = () => {
  const { data: shabbatTimes = [], isLoading, error } = useQuery({
    queryKey: ['shabbat-times-hebcal'],
    queryFn: fetchShabbatTimesFromHebcal,
    staleTime: 1000 * 60 * 60 * 12, // Cache for 12 hours
    gcTime: 1000 * 60 * 60 * 24 * 3, // Keep in memory for 3 days
    retry: 2,
  });

  const getShabbatTimesForDate = (date: Date): ShabbatTimes | null => {
    const dateStr = date.toISOString().split('T')[0];
    return shabbatTimes.find(times => times.date === dateStr) || null;
  };

  const getShabbatTimesForWeek = (startDate: Date): ShabbatTimes[] => {
    const weekTimes: ShabbatTimes[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const times = getShabbatTimesForDate(date);
      if (times) {
        weekTimes.push(times);
      }
    }
    return weekTimes;
  };

  const isShabbat = (date: Date): boolean => {
    return date.getDay() === 6; // Saturday
  };

  const isFriday = (date: Date): boolean => {
    return date.getDay() === 5; // Friday
  };

  return {
    shabbatTimes,
    isLoading,
    error,
    getShabbatTimesForDate,
    getShabbatTimesForWeek,
    isShabbat,
    isFriday
  };
};
