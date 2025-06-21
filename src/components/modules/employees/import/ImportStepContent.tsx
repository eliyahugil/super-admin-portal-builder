
import React from 'react';
import { ImportFileUpload } from '../ImportFileUpload';
import { FieldMappingDialog } from '../FieldMappingDialog';
import { ImportResults } from '../ImportResults';
import { EmployeeImportSummary } from '../steps/EmployeeImportSummary';
import type { ImportStep, EmployeeImportHook } from '@/hooks/useEmployeeImport/types';

interface ImportStepContentProps {
  step: ImportStep;
  importHook: EmployeeImportHook;
}

export const ImportStepContent: React.FC<ImportStepContentProps> = ({
  step,
  importHook
}) => {
  console.log('🎯 ImportStepContent rendering with step:', step);
  
  const {
    processFile,
    downloadTemplate,
    showMappingDialog,
    setShowMappingDialog,
    headers,
    rawData,
    confirmMapping,
    executeImport,
    importResult,
    resetForm,
    setStep
  } = importHook;

  console.log('📊 ImportStepContent state:', {
    step,
    showMappingDialog,
    headersCount: headers.length,
    rawDataCount: rawData.length,
    hasImportResult: !!importResult,
    executeImportFunction: typeof executeImport
  });

  // Modified confirmMapping to go directly to importing
  const handleConfirmMappingAndImport = async (mappings: any) => {
    console.log('🚀 Direct import after mapping confirmation');
    try {
      // Apply the mapping
      await confirmMapping(mappings);
      // Skip preview step and go directly to importing
      setStep('importing');
      // Execute import immediately
      await executeImport();
    } catch (error) {
      console.error('❌ Direct import failed:', error);
    }
  };

  // פונקציה לחזרה למיפוי מתוצאות השגיאות
  const handleBackToMapping = () => {
    console.log('🔄 Going back to mapping from results');
    setStep('mapping');
    setShowMappingDialog(true);
  };

  switch (step) {
    case 'upload':
      console.log('📤 Rendering upload step');
      return (
        <ImportFileUpload
          onFileSelect={processFile}
          onDownloadTemplate={downloadTemplate}
        />
      );

    case 'mapping':
      console.log('🗺️ Rendering mapping step, showDialog:', showMappingDialog);
      return (
        <FieldMappingDialog
          open={showMappingDialog}
          onOpenChange={setShowMappingDialog}
          fileColumns={headers}
          sampleData={rawData.slice(0, 3)}
          onConfirm={handleConfirmMappingAndImport}
        />
      );

    case 'importing':
      console.log('⏳ Rendering importing step');
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">מייבא עובדים...</p>
          <p className="mt-1 text-sm text-gray-500">זה עלול לקחת כמה רגעים</p>
        </div>
      );

    case 'results':
      console.log('📋 Rendering results step');
      return (
        <ImportResults 
          result={importResult} 
          onClose={resetForm}
          onBackToMapping={handleBackToMapping}
        />
      );

    case 'summary':
      console.log('📊 Rendering summary step');
      return (
        <EmployeeImportSummary 
          result={importResult}
          onStartOver={resetForm}
          onClose={resetForm}
        />
      );

    default:
      console.log('❌ Unknown step:', step);
      return null;
  }
};
