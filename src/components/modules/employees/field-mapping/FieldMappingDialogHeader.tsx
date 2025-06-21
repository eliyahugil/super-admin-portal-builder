
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FloatingAutoMappingMenu } from './FloatingAutoMappingMenu';

interface FieldMappingDialogHeaderProps {
  hasAutoDetections: boolean;
  mappedCount: number;
  totalColumns: number;
  onApplyAutoMapping: () => void;
  onClearMappings: () => void;
  onRemoveUnmapped: () => void;
  onBack: () => void;
}

export const FieldMappingDialogHeader: React.FC<FieldMappingDialogHeaderProps> = ({
  hasAutoDetections,
  mappedCount,
  totalColumns,
  onApplyAutoMapping,
  onClearMappings,
  onRemoveUnmapped,
  onBack,
}) => {
  return (
    <DialogHeader className="p-6 pb-0">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl">מיפוי שדות לייבוא</DialogTitle>
        <div className="flex items-center gap-2">
          {hasAutoDetections && (
            <FloatingAutoMappingMenu
              onApplyAutoMapping={onApplyAutoMapping}
              onClearMappings={onClearMappings}
              onRemoveUnmapped={onRemoveUnmapped}
              hasAutoDetections={hasAutoDetections}
              mappedCount={mappedCount}
              totalColumns={totalColumns}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
};
