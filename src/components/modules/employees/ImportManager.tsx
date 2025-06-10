
import React from 'react';
import { ImportButton } from './ImportButton';
import { ImportProcessDialog } from './ImportProcessDialog';
import { ImportMappingDialog } from './ImportMappingDialog';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

export const ImportManager: React.FC = () => {
  const importHook = useEmployeeImport();

  return (
    <ImportErrorBoundary>
      <ImportButton onClick={() => importHook.setStep('upload')} />
      
      <ImportProcessDialog importHook={importHook} />
      
      <ImportMappingDialog importHook={importHook} />
    </ImportErrorBoundary>
  );
};
