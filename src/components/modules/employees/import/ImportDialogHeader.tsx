
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ImportStep } from '@/hooks/useEmployeeImport/types';

interface ImportDialogHeaderProps {
  step: ImportStep;
}

export const ImportDialogHeader: React.FC<ImportDialogHeaderProps> = ({ step }) => {
  const getDialogTitle = () => {
    switch (step) {
      case 'upload':
        return 'ייבוא עובדים מקובץ Excel';
      case 'preview':
        return 'תצוגה מקדימה ובדיקת תקינות';
      case 'results':
        return 'תוצאות הייבוא';
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
      case 'results':
        return 'תוצאות הייבוא העובדים';
      default:
        return 'בחר קובץ Excel להעלאה';
    }
  };

  return (
    <DialogHeader>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogDescription>
        {getDialogDescription()}
      </DialogDescription>
    </DialogHeader>
  );
};
