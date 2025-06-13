
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Upload, FileText, Eye, Download } from 'lucide-react';
import { ImportFileUpload } from './ImportFileUpload';
import { ImportPreview } from './ImportPreview';
import { ImportResults } from './ImportResults';

interface ImportProcessDialogProps {
  importHook: any;
}

export const ImportProcessDialog: React.FC<ImportProcessDialogProps> = ({ importHook }) => {
  const {
    step,
    file,
    previewData,
    importResult,
    handleFileSelect,
    handleConfirmImport,
    resetForm,
    downloadTemplate
  } = importHook;

  const isOpen = step !== 'upload' || !!file;

  const getStepIcon = (currentStep: string) => {
    switch (currentStep) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'preview':
        return <Eye className="h-5 w-5" />;
      case 'results':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'upload':
        return 'העלאת קובץ אקסל';
      case 'preview':
        return 'תצוגה מקדימה';
      case 'importing':
        return 'מייבא נתונים...';
      case 'results':
        return 'תוצאות ייבוא';
      default:
        return 'ייבוא עובדים';
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <ImportFileUpload
            onFileSelect={handleFileSelect}
            onDownloadTemplate={downloadTemplate}
          />
        );
      case 'preview':
        return (
          <ImportPreview
            previewData={previewData}
            onConfirm={handleConfirmImport}
            onCancel={resetForm}
          />
        );
      case 'importing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">מייבא עובדים...</h3>
            <p className="text-gray-600">אנא המתן, זה עלול לקחת כמה רגעים</p>
          </div>
        );
      case 'results':
        return (
          <ImportResults
            result={importResult}
            onClose={resetForm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            {getStepIcon(step)}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">שלב {step === 'upload' ? '1' : step === 'preview' ? '2' : '3'} מתוך 3</span>
          </div>
          <Progress 
            value={
              step === 'upload' ? 33 : 
              step === 'preview' ? 66 : 
              100
            } 
            className="h-2"
          />
        </div>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
