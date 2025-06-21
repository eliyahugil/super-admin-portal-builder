
import { useState } from 'react';
import { useEmployeeImport as useEmployeeImportHook } from './useEmployeeImport/useEmployeeImportHook';
import type { EmployeeImportHook } from './useEmployeeImport/types';

export const useEmployeeImport = (selectedBusinessId?: string | null): EmployeeImportHook => {
  return useEmployeeImportHook(selectedBusinessId);
};

export * from './useEmployeeImport/types';
