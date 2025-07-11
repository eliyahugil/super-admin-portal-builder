
import { useQuery } from '@tanstack/react-query';

export interface IsraeliHoliday {
  id: string;
  name: string;
  hebrewName: string;
  date: string;
  type: 'חג' | 'מועד' | 'יום זיכרון' | 'יום עצמאות' | 'צום';
  description?: string;
  isWorkingDay: boolean;
}

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
