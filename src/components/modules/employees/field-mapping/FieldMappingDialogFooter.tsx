
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogFooterProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  canProceed: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const FieldMappingDialogFooter: React.FC<FieldMappingDialogFooterProps> = ({
  mappings,
  fileColumns,
  canProceed,
  onBack,
  onConfirm,
}) => {
  return (
    <div className="border-t p-6 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        {mappings.filter(m => m.mappedColumns.length > 0).length} שדות ממופים מתוך {fileColumns.length} עמודות
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
        >
          ביטול
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          המשך לתצוגה מקדימה
        </Button>
      </div>
    </div>
  );
};
