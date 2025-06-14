
import { useGenericArchive } from '@/hooks/useGenericArchive';

export const useEmployeeArchive = () => {
  return useGenericArchive({
    tableName: 'employees',
    entityName: 'העובד',
    queryKey: ['employees'],
    getEntityDisplayName: (employee) => `${employee.first_name} ${employee.last_name}`
  });
};
