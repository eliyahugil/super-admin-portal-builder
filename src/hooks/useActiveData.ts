
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface UseActiveDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
}

interface BaseEntity {
  id: string;
  [key: string]: any;
}

export const useActiveData = <T extends BaseEntity = BaseEntity>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
}: UseActiveDataOptions): UseQueryResult<T[], Error> => {
  return useBusinessData<T>({
    tableName,
    queryKey,
    filter: 'active',
    selectedBusinessId,
    select,
  });
};
