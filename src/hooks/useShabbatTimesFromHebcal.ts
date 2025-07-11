
import { useQuery } from '@tanstack/react-query';
import type { ShabbatTimes } from '@/types/calendar';

export type { ShabbatTimes };

export const useShabbatTimesFromHebcal = () => {
  const { data: shabbatTimes = [], isLoading, error } = useQuery({
    queryKey: ['shabbat-times'],
    queryFn: async (): Promise<ShabbatTimes[]> => {
      // Mock data for now - this can be replaced with actual Hebcal API integration
      return [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    shabbatTimes,
    isLoading,
    error
  };
};
