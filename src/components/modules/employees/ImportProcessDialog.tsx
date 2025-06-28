
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Upload, FileText, Eye, Download, X } from 'lucide-react';
import { ImportStepContent } from './import/ImportStepContent';

interface ImportProcessDialogProps {
  importHook: any;
}

export const ImportProcessDialog: React.FC<ImportProcessDialogProps> = ({ importHook }) => {
  const {
    step,
    setStep,
    resetForm,
  } = importHook;

  // Dialog should be open when step is not 'closed'
  const isOpen = step !== 'closed';

  console.log('📋 ImportProcessDialog - Dialog state:', {
    step,
    isOpen,
    importHook: Object.keys(importHook)
  });

  const getStepIcon = (currentStep: string) => {
    switch (currentStep) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'mapping':
        return <FileText className="h-5 w-5" />;
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
      case 'mapping':
        return 'מיפוי שדות';
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

  const getProgressValue = () => {
    switch (step) {
      case 'upload':
        return 20;
      case 'mapping':
        return 40;
      case 'preview':
        return 60;
      case 'importing':
        return 80;
      case 'results':
        return 100;
      default:
        return 0;
    }
  };

  const handleClose = () => {
    console.log('🔄 Closing import dialog');
    setStep('closed');
    resetForm();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('📋 ImportProcessDialog - onOpenChange called with:', open);
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getStepIcon(step)}
              {getStepTitle()}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">התקדמות</span>
            <span className="text-sm text-gray-500">{getProgressValue()}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        <ImportStepContent step={step} importHook={importHook} />
      </DialogContent>
    </Dialog>
  );
};
