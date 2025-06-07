
import React from 'react';
import { DialogTrigger } from '@/components/ui/dialog';
import { ImportButton } from './ImportButton';
import { ImportDialog } from './ImportDialog';
import { EmployeeImportMappingStep } from './steps/EmployeeImportMappingStep';
import { ValidationSummaryDialog } from './ValidationSummaryDialog';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

export const EmployeeExcelImporter: React.FC = () => {
  const {
    headers,
    showMappingDialog,
    systemFields,
    sampleData,
    validationErrors,
    duplicateErrors,
    handleMappingConfirm,
    setShowMappingDialog,
    getValidationSummary,
  } = useEmployeeImport();

  const [isOpen, setIsOpen] = React.useState(false);
  const [showValidationSummary, setShowValidationSummary] = React.useState(false);

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

      <ValidationSummaryDialog
        open={showValidationSummary}
        onOpenChange={setShowValidationSummary}
        validationErrors={validationErrors}
        duplicateErrors={duplicateErrors}
        summary={getValidationSummary()}
      />
    </>
  );
};
