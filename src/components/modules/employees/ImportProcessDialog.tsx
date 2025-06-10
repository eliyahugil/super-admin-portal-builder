
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImportDialogHeader } from './import/ImportDialogHeader';
import { ImportStepContent } from './import/ImportStepContent';
import type { EmployeeImportHook } from '@/hooks/useEmployeeImport/types';

interface ImportProcessDialogProps {
  importHook: EmployeeImportHook;
}

export const ImportProcessDialog: React.FC<ImportProcessDialogProps> = ({
  importHook
}) => {
  const isOpen = importHook.step !== 'upload' && !importHook.showMappingDialog;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        importHook.resetForm();
      }
    }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <ImportDialogHeader step={importHook.step} />
        <div className="mt-4">
          <ImportStepContent importHook={importHook} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
