
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseArchivedDataOptions {
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
 * Secure hook for fetching archived data with business isolation
 */
export const useArchivedData = <T extends BaseEntity = BaseEntity>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseArchivedDataOptions): UseQueryResult<T[], Error> => {
  return useBusinessData<T>({
    tableName,
    queryKey: [...queryKey, 'archived'],
    filter: 'archived',
    selectedBusinessId,
    select,
  });
};
