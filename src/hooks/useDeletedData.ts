
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseDeletedDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

interface BaseEntity {
  id: string;
  business_id?: string;
  [key: string]: any;
}

/**
 * Secure hook for fetching deleted data with business isolation
 */
export const useDeletedData = <T extends BaseEntity = BaseEntity>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseDeletedDataOptions): UseQueryResult<T[], Error> => {
  return useBusinessData<T>({
    tableName,
    queryKey: [...queryKey, 'deleted'],
    filter: 'deleted',
    selectedBusinessId,
    select,
  });
};
