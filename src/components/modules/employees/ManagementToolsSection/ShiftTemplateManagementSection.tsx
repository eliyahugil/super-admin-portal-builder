
import React from 'react';
import { Clock } from 'lucide-react';
// עדכון מסלול יבוא נכון (הבנוי)
import { QuickShiftTemplateCreator } from '../CreateShiftForm/QuickShiftTemplateCreatorDialog';
import { ShiftTemplateManagementSectionProps } from './types';

export const ShiftTemplateManagementSection: React.FC<ShiftTemplateManagementSectionProps> = () => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        ניהול תבניות משמרות
      </h3>
      <QuickShiftTemplateCreator />
    </div>
  );
};
