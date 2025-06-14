
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseArchivedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useArchivedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseArchivedDataOptions): UseQueryResult<T[]> => {
  return useBusinessData<T>({
    tableName,
    queryKey,
    filter: 'archived',
    selectedBusinessId,
    select,
  });
};
