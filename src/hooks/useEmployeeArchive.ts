
import { useGenericArchive } from '@/hooks/useGenericArchive';
import type { Employee } from '@/types/employee';

export const useEmployeeArchive = () => {
  return useGenericArchive<Employee>({
    tableName: 'employees',
    entityName: 'העובד',
    queryKey: ['employees'],
    getEntityDisplayName: (employee) => `${employee.first_name} ${employee.last_name}`
  });
};
