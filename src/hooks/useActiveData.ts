
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseActiveDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useActiveData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseActiveDataOptions): UseQueryResult<T[]> => {
  return useBusinessData<T>({
    tableName,
    queryKey,
    filter: 'active',
    selectedBusinessId,
    select,
  });
};
