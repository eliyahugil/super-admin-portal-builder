
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

  switch (step) {
    case 'upload':
      return (
        <ImportFileUpload
          onFileSelect={processFile}
          onDownloadTemplate={downloadTemplate}
        />
      );

    case 'mapping':
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
      return (
        <ImportPreview
          previewData={previewData}
          onConfirm={executeImport}
          onCancel={resetForm}
        />
      );

    case 'importing':
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">מייבא עובדים...</p>
        </div>
      );

    case 'results':
      return (
        <ImportResults 
          result={importResult} 
          onClose={resetForm} 
        />
      );

    case 'summary':
      return (
        <EmployeeImportSummary 
          result={importResult}
          onStartOver={resetForm}
          onClose={resetForm}
        />
      );

    default:
      return null;
  }
};
