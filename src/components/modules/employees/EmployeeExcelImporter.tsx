
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { FieldMappingDialog } from './FieldMappingDialog';
import { EmployeeImportUploadStep } from './EmployeeImportUploadStep';
import { EmployeeImportPreviewStep } from './EmployeeImportPreviewStep';
import { useEmployeeImport } from '@/hooks/useEmployeeImport';

export const EmployeeExcelImporter: React.FC = () => {
  const {
    // State
    step,
    headers,
    previewData,
    isImporting,
    showMappingDialog,
    systemFields,
    sampleData,
    
    // Actions
    handleFileUpload,
    handleMappingConfirm,
    handleImport,
    downloadTemplate,
    setShowMappingDialog,
  } = useEmployeeImport();

  const [isOpen, setIsOpen] = React.useState(false);

  const handleDialogClose = () => {
    setIsOpen(false);
  };

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
              setIsOpen(false);
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            ייבוא מקובץ Excel
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ייבוא עובדים מקובץ Excel</DialogTitle>
          </DialogHeader>

          {renderStepContent()}
        </DialogContent>
      </Dialog>

      {/* Field Mapping Dialog */}
      <FieldMappingDialog
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
