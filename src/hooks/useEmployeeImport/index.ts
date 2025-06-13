
import { useState } from 'react';
import { useEmployeeImport as useEmployeeImportHook } from './useEmployeeImportHook';
import type { EmployeeImportHook } from './types';

export const useEmployeeImport = (): EmployeeImportHook => {
  return useEmployeeImportHook();
};

export * from './types';
