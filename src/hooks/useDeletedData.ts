
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseDeletedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

export const useDeletedData = <T = any>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseDeletedDataOptions): UseQueryResult<T[]> => {
  return useBusinessData<T>({
    tableName,
    queryKey,
    filter: 'deleted',
    selectedBusinessId,
    select,
  });
};
