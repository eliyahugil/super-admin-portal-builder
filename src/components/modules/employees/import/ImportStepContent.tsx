
import React from 'react';
import { ImportFileUpload } from '../ImportFileUpload';
import { FieldMappingDialog } from '../FieldMappingDialog';
import { ImportPreview } from '../ImportPreview';
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
    previewData,
    executeImport,
    importResult,
    resetForm
  } = importHook;

  console.log('📊 ImportStepContent state:', {
    step,
    showMappingDialog,
    headersCount: headers.length,
    rawDataCount: rawData.length,
    previewDataCount: previewData.length,
    hasImportResult: !!importResult,
    executeImportFunction: typeof executeImport
  });

  const handleExecuteImport = async () => {
    console.log('🚀 ImportStepContent - handleExecuteImport called');
    try {
      await executeImport();
      console.log('✅ ImportStepContent - executeImport completed successfully');
    } catch (error) {
      console.error('❌ ImportStepContent - executeImport failed:', error);
    }
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
          onConfirm={confirmMapping}
        />
      );

    case 'preview':
      console.log('👁️ Rendering preview step with data count:', previewData.length);
      return (
        <ImportPreview
          previewData={previewData}
          onConfirm={handleExecuteImport}
          onCancel={resetForm}
        />
      );

    case 'importing':
      console.log('⏳ Rendering importing step');
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">מייבא עובדים...</p>
        </div>
      );

    case 'results':
      console.log('📋 Rendering results step');
      return (
        <ImportResults 
          result={importResult} 
          onClose={resetForm} 
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
