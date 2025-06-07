
import React from 'react';
import { DialogTrigger } from '@/components/ui/dialog';
import { ImportButton } from './ImportButton';
import { ImportDialog } from './ImportDialog';
import { EmployeeImportMappingStep } from './steps/EmployeeImportMappingStep';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

export const EmployeeExcelImporter: React.FC = () => {
  const {
    headers,
    showMappingDialog,
    systemFields,
    sampleData,
    handleMappingConfirm,
    setShowMappingDialog,
  } = useEmployeeImport();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <DialogTrigger asChild>
        <ImportButton onClick={() => setIsOpen(true)} />
      </DialogTrigger>

      <ImportDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />

      <EmployeeImportMappingStep
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        fileColumns={headers}
        sampleData={sampleData}
        onConfirm={handleMappingConfirm}
        systemFields={systemFields}
      />
    </>
  );
};
