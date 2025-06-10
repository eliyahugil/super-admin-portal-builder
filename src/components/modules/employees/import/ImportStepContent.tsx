
import React from 'react';
import { EmployeeImportUploadStep } from '../steps/EmployeeImportUploadStep';
import { EmployeeValidationResults } from '../EmployeeValidationResults';
import { EmployeeImportSummary } from '../steps/EmployeeImportSummary';
import type { EmployeeImportHook } from '@/hooks/useEmployeeImport/types';

interface ImportStepContentProps {
  importHook: EmployeeImportHook;
}

export const ImportStepContent: React.FC<ImportStepContentProps> = ({
  importHook
}) => {
  console.log('🎬 Rendering step content for:', importHook.step);
  
  switch (importHook.step) {
    case 'upload':
      return (
        <EmployeeImportUploadStep
          onFileUpload={(file) => {
            console.log('📄 File selected:', file.name);
            importHook.handleFileUpload(file);
          }}
          onDownloadTemplate={importHook.downloadTemplate}
        />
      );
    
    case 'preview':
      return (
        <EmployeeValidationResults
          validationErrors={importHook.validationErrors}
          duplicateErrors={importHook.duplicateErrors}
          summary={importHook.getValidationSummary()}
          onContinueImport={importHook.handleImport}
          onBackToMapping={() => importHook.setShowMappingDialog(true)}
          isImporting={importHook.isImporting}
        />
      );
    
    case 'summary':
      return (
        <EmployeeImportSummary
          result={importHook.importResult}
          onStartOver={importHook.resetForm}
          onClose={() => importHook.resetForm()}
        />
      );
    
    default:
      console.warn('⚠️ Unknown step:', importHook.step);
      return (
        <div className="text-center py-8">
          <p>שלב לא מזוהה: {importHook.step}</p>
        </div>
      );
  }
};
