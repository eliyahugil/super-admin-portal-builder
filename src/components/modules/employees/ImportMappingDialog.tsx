
import React from 'react';
import { FieldMappingDialog } from './FieldMappingDialog';
import type { EmployeeImportHook } from '@/hooks/useEmployeeImport/types';

interface ImportMappingDialogProps {
  importHook: EmployeeImportHook;
}

export const ImportMappingDialog: React.FC<ImportMappingDialogProps> = ({
  importHook
}) => {
  return (
    <FieldMappingDialog
      open={importHook.showMappingDialog}
      onOpenChange={importHook.setShowMappingDialog}
      fileColumns={importHook.headers}
      sampleData={importHook.sampleData}
      onConfirm={importHook.handleMappingConfirm}
      systemFields={importHook.systemFields}
    />
  );
};
