
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
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

  const [isOpen, setIsOpen] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  console.log('📋 EmployeeExcelImporter - Current state:', {
    isOpen,
    showMappingDialog,
    showValidationSummary,
    hasHeaders: headers.length > 0,
    hasSampleData: sampleData.length > 0
  });

  return (
    <>
      <ImportButton onClick={() => {
        console.log('🚀 Opening import dialog...');
        setIsOpen(true);
      }} />

      <Dialog open={isOpen} onOpenChange={(open) => {
        console.log('📂 Import dialog state changed:', open);
        setIsOpen(open);
      }}>
        <ImportDialog
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      </Dialog>

      <EmployeeImportMappingStep
        open={showMappingDialog}
        onOpenChange={(open) => {
          console.log('🔄 Mapping dialog state changed:', open);
          setShowMappingDialog(open);
        }}
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
