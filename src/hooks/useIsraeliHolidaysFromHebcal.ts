
import { useQuery } from '@tanstack/react-query';
import type { IsraeliHoliday } from '@/types/calendar';

export type { IsraeliHoliday };

export const useIsraeliHolidaysFromHebcal = () => {
  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ['israeli-holidays'],
    queryFn: async (): Promise<IsraeliHoliday[]> => {
      // Mock data for now - this can be replaced with actual Hebcal API integration
      return [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    holidays,
    isLoading,
    error
  };
};
