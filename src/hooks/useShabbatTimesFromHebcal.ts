
import { useQuery } from '@tanstack/react-query';

export interface ShabbatTimes {
  date: string;
  candleLighting?: string;
  havdalah?: string;
  parsha?: string;
}

interface HebcalShabbatResponse {
  items: Array<{
    date: string;
    hebrew?: string;
    title: string;
    category: string;
    subcat?: string;
    memo?: string;
  }>;
}

const fetchShabbatTimesFromHebcal = async (): Promise<ShabbatTimes[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    console.log('🕯️ Fetching Shabbat times from Hebcal for years:', currentYear, nextYear);
    
    const promises = [currentYear, nextYear].map(async (year) => {
      // URL לקבלת זמני שבת ופרשות השבוע מירושלים
      const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&c=on&geo=geoname&geonameid=281184&year=${year}&s=on`;
      
      console.log(`🕯️ Fetching Shabbat times for year ${year}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP error for Shabbat times year ${year}:`, response.status);
        return [];
      }
      
      const data: HebcalShabbatResponse = await response.json();
      console.log(`✅ Received ${data.items?.length || 0} Shabbat items for year ${year}`);
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn(`No Shabbat items found for year ${year}`);
        return [];
      }
      
      // קבץ את האירועים לפי תאריכי שבת
      const shabbatMap = new Map<string, Partial<ShabbatTimes>>();
      
      data.items.forEach(item => {
        const itemDate = new Date(item.date);
        const fridayDate = new Date(itemDate);
        
        // מצא את יום שישי הקרוב
        const dayOfWeek = itemDate.getDay();
        if (dayOfWeek === 5) { // יום שישי
          fridayDate.setDate(itemDate.getDate());
        } else if (dayOfWeek === 6) { // יום שבת
          fridayDate.setDate(itemDate.getDate() - 1);
        } else {
          return; // לא רלוונטי
        }
        
        const shabbatKey = fridayDate.toISOString().split('T')[0];
        
        if (!shabbatMap.has(shabbatKey)) {
          shabbatMap.set(shabbatKey, { date: shabbatKey });
        }
        
        const shabbatEntry = shabbatMap.get(shabbatKey)!;
        
        if (item.category === 'candles') {
          shabbatEntry.candleLighting = item.title.match(/\d{2}:\d{2}/)?.[0];
        } else if (item.category === 'havdalah') {
          shabbatEntry.havdalah = item.title.match(/\d{2}:\d{2}/)?.[0];
        } else if (item.category === 'parashat') {
          shabbatEntry.parsha = item.hebrew || item.title.replace('Parashat ', '');
        }
      });
      
      return Array.from(shabbatMap.values()) as ShabbatTimes[];
    });
    
    const results = await Promise.all(promises);
    const allShabbats = results.flat().filter(s => s.candleLighting || s.havdalah || s.parsha);
    
    console.log('🕯️ Total Shabbat times loaded:', allShabbats.length);
    console.log('🕯️ Sample Shabbat times:', allShabbats.slice(0, 3));
    
    return allShabbats;
  } catch (error) {
    console.error('❌ Error fetching Shabbat times from Hebcal:', error);
    return [];
  }
};

export const useShabbatTimesFromHebcal = () => {
  const { data: shabbatTimes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['shabbat-times-hebcal'],
    queryFn: fetchShabbatTimesFromHebcal,
    staleTime: 1000 * 60 * 60 * 12, // Cache for 12 hours
    gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log('🔍 useShabbatTimesFromHebcal state:', {
    shabbatTimesCount: shabbatTimes.length,
    isLoading,
    hasError: !!error
  });

  const getShabbatForDate = (date: Date): ShabbatTimes | null => {
    const dateStr = date.toISOString().split('T')[0];
    const found = shabbatTimes.find(shabbat => shabbat.date === dateStr);
    if (found) {
      console.log(`🕯️ Shabbat for ${dateStr}:`, found);
    }
    return found || null;
  };

  return {
    shabbatTimes,
    isLoading,
    error,
    refetch,
    getShabbatForDate
  };
};
