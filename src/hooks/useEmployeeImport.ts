
import { useState } from 'react';
import { useEmployeeImport as useEmployeeImportHook } from './useEmployeeImport/useEmployeeImportHook';
import type { EmployeeImportHook } from './useEmployeeImport/types';

export const useEmployeeImport = (): EmployeeImportHook => {
  return useEmployeeImportHook();
};

export * from './useEmployeeImport/types';
