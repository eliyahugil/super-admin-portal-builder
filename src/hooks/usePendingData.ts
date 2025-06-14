
import { UseQueryResult } from '@tanstack/react-query';
import { useBusinessData } from './useBusinessData';

type AllowedTableNames = 'employee_requests' | 'shift_submissions' | 'customer_agreements';

interface UsePendingDataOptions {
  tableName: AllowedTableNames;
  queryKey: string[];
  selectedBusinessId?: string | null;
  select?: string;
  statusField?: string;
}

interface BaseEntity {
  id: string;
  [key: string]: any;
}

export const usePendingData = <T extends BaseEntity = BaseEntity>({
  tableName,
  queryKey,
  selectedBusinessId,
  select = '*',
  statusField = 'status',
}: UsePendingDataOptions): UseQueryResult<T[], Error> => {
  return useBusinessData<T>({
    tableName: tableName as any, // Type assertion needed due to different table types
    queryKey,
    filter: 'pending',
    selectedBusinessId,
    select,
    statusField,
  });
};
