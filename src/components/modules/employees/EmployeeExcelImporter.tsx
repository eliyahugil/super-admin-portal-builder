
import React, { useState, useEffect } from 'react';
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
    hasSampleData: sampleData.length > 0,
    headersPreview: headers.slice(0, 5),
    sampleDataPreview: sampleData.slice(0, 2)
  });

  // Enhanced logging for mapping dialog state changes
  useEffect(() => {
    console.log('🔔 MAPPING DIALOG STATE CHANGE:', {
      showMappingDialog,
      headers: headers.length,
      sampleData: sampleData.length,
      hasData: headers.length > 0 && sampleData.length > 0,
      timestamp: new Date().toISOString()
    });

    if (showMappingDialog && headers.length === 0) {
      console.error('❌ Mapping dialog opened but no headers available!');
    }

    if (showMappingDialog && sampleData.length === 0) {
      console.error('❌ Mapping dialog opened but no sample data available!');
    }

    if (showMappingDialog && headers.length > 0 && sampleData.length > 0) {
      console.log('✅ Mapping dialog should be working correctly now');
    }
  }, [showMappingDialog, headers.length, sampleData.length]);

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
          console.log('🔄 Mapping dialog state manually changed by user:', open);
          setShowMappingDialog(open);
        }}
        fileColumns={headers}
        sampleData={sampleData}
        onConfirm={(mappings) => {
          console.log('✅ Mapping confirmed with mappings:', mappings.length);
          handleMappingConfirm(mappings);
        }}
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
