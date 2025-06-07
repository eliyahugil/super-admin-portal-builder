
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeImportUploadStep } from './steps/EmployeeImportUploadStep';
import { EmployeeImportPreviewStep } from './steps/EmployeeImportPreviewStep';
import { EmployeeImportSummary } from './steps/EmployeeImportSummary';
import { useEmployeeImport, ImportStep } from '@/hooks/useEmployeeImport';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    step,
    previewData,
    isImporting,
    importResult,
    handleFileUpload,
    handleImport,
    downloadTemplate,
    setShowMappingDialog,
    resetForm,
  } = useEmployeeImport();

  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <EmployeeImportUploadStep
            onFileUpload={handleFileUpload}
            onDownloadTemplate={downloadTemplate}
          />
        );
      
      case 'preview':
        return (
          <EmployeeImportPreviewStep
            previewData={previewData}
            isImporting={isImporting}
            onBackToMapping={() => setShowMappingDialog(true)}
            onConfirmImport={async () => {
              await handleImport();
            }}
          />
        );
      
      case 'summary':
        return (
          <EmployeeImportSummary
            result={importResult}
            onStartOver={() => {
              resetForm();
            }}
            onClose={() => onOpenChange(false)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ייבוא עובדים מקובץ Excel</DialogTitle>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};
