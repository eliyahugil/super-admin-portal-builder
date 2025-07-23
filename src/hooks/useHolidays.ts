
import { useState } from 'react';
import type { IsraeliHoliday } from '@/types/calendar';

export const useHolidays = () => {
  const [holidays] = useState<IsraeliHoliday[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    holidays,
    isLoading,
    error,
    refetch: () => Promise.resolve()
  };
};
