
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
    fieldMappings,
    setFieldMappings,
    previewData,
    setPreviewData,
    executeImport,
    importResult
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
          headers={headers}
          fieldMappings={fieldMappings}
          onMappingsChange={setFieldMappings}
          onPreviewData={setPreviewData}
        />
      );

    case 'preview':
      return (
        <ImportPreview
          previewData={previewData}
          onExecuteImport={executeImport}
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
        <ImportResults result={importResult} />
      );

    case 'summary':
      return (
        <EmployeeImportSummary result={importResult} />
      );

    default:
      return null;
  }
};
