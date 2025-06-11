
import { useState } from 'react';
import { useEmployeeImport as useEmployeeImportHook } from './useEmployeeImportHook';

export const useEmployeeImport = () => {
  return useEmployeeImportHook();
};

export * from './types';
