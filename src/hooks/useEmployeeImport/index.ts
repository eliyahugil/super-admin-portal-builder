
import { useEmployeeImport as useEmployeeImportHook } from './useEmployeeImportHook';
import type { EmployeeImportHook } from './types';

export const useEmployeeImport = (selectedBusinessId?: string | null): EmployeeImportHook => {
  return useEmployeeImportHook(selectedBusinessId);
};

export * from './types';
