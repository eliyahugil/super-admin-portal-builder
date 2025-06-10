
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EmployeeImportUploadStep } from './steps/EmployeeImportUploadStep';
import { EmployeeValidationResults } from './EmployeeValidationResults';
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
    validationErrors,
    duplicateErrors,
    handleFileUpload,
    handleImport,
    downloadTemplate,
    setShowMappingDialog,
    resetForm,
    getValidationSummary,
  } = useEmployeeImport();

  console.log('🎭 ImportDialog - Current step:', step, 'Dialog open:', open);

  const getDialogTitle = () => {
    switch (step) {
      case 'upload':
        return 'ייבוא עובדים מקובץ Excel';
      case 'preview':
        return 'תצוגה מקדימה ובדיקת תקינות';
      case 'summary':
        return 'סיכום הייבוא';
      default:
        return 'ייבוא עובדים מקובץ Excel';
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case 'upload':
        return 'העלה קובץ Excel עם נתוני העובדים שברצונך לייבא';
      case 'preview':
        return 'בדוק את הנתונים לפני הייבוא סופי';
      case 'summary':
        return 'תוצאות הייבוא העובדים';
      default:
        return 'בחר קובץ Excel להעלאה';
    }
  };

  const renderStepContent = () => {
    console.log('🎬 Rendering step content for:', step);
    
    switch (step) {
      case 'upload':
        return (
          <EmployeeImportUploadStep
            onFileUpload={(file) => {
              console.log('📄 File selected in ImportDialog:', file.name);
              handleFileUpload(file);
            }}
            onDownloadTemplate={downloadTemplate}
          />
        );
      
      case 'preview':
        return (
          <EmployeeValidationResults
            validationErrors={validationErrors}
            duplicateErrors={duplicateErrors}
            summary={getValidationSummary()}
            onContinueImport={handleImport}
            onBackToMapping={() => setShowMappingDialog(true)}
            isImporting={isImporting}
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
        console.warn('⚠️ Unknown step:', step);
        return (
          <div className="text-center py-8">
            <p>שלב לא מזוהה: {step}</p>
          </div>
        );
    }
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogDescription>
          {getDialogDescription()}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4">
        {renderStepContent()}
      </div>
    </DialogContent>
  );
};
