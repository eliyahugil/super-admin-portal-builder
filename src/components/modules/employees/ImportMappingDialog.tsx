
import React from 'react';
import { FieldMappingDialog } from './FieldMappingDialog';
import type { EmployeeImportHook } from '@/hooks/useEmployeeImport/types';

interface ImportMappingDialogProps {
  importHook: EmployeeImportHook;
}

export const ImportMappingDialog: React.FC<ImportMappingDialogProps> = ({ importHook }) => {
  const {
    showMappingDialog,
    setShowMappingDialog,
    headers,
    rawData,
    confirmMapping,
  } = importHook;

  return (
    <FieldMappingDialog
      open={showMappingDialog}
      onOpenChange={setShowMappingDialog}
      fileColumns={headers}
      sampleData={rawData.slice(0, 3)}
      onConfirm={confirmMapping}
    />
  );
};
