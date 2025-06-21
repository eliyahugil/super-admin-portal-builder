
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { CustomFieldCreationSection } from './CustomFieldCreationSection';
import { FieldMappingList } from './field-mapping/FieldMappingList';
import { DataPreviewTable } from './field-mapping/DataPreviewTable';
import { useFieldMappingLogic } from './field-mapping/useFieldMappingLogic';
import { defaultSystemFields } from './field-mapping/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  systemFields?: Array<{ value: string; label: string; required?: boolean }>;
}

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  systemFields = defaultSystemFields,
}) => {
  const isMobile = useIsMobile();
  
  const {
    mappings,
    handleMappingChange,
    handleAddCustomField,
    handleRemoveMapping,
    handleMoveMapping,
    getSystemFieldLabel,
    isSystemFieldRequired,
    hasRequiredMappings,
    handleConfirm,
  } = useFieldMappingLogic({ 
    systemFields,
    fileColumns // Pass file columns for auto-detection
  });

  // Show auto-detection status
  const autoMappedCount = mappings.filter(m => m.mappedColumns.length > 0).length;
  const totalRequiredFields = mappings.filter(m => isSystemFieldRequired(m.systemField)).length;
  const mappedRequiredFields = mappings.filter(m => isSystemFieldRequired(m.systemField) && m.mappedColumns.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${isMobile ? 'max-h-[95vh] w-[95vw] m-2' : 'max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
            מיפוי שדות - התאמת עמודות האקסל לשדות המערכת
          </DialogTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>זוהו אוטומטית {autoMappedCount} שדות מתוך {mappings.length}</p>
            <p>שדות חובה ממופים: {mappedRequiredFields}/{totalRequiredFields}</p>
            {autoMappedCount > 0 && (
              <p className="text-green-600">✅ המיפוי האוטומטי זיהה בהצלחה חלק מהשדות</p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Custom Field Creation Section */}
          <CustomFieldCreationSection onAddCustomField={handleAddCustomField} />

          {/* Field Mapping Section */}
          <FieldMappingList
            mappings={mappings}
            fileColumns={fileColumns}
            systemFields={systemFields}
            onMappingChange={handleMappingChange}
            onMoveMapping={handleMoveMapping}
            onRemoveMapping={handleRemoveMapping}
            getSystemFieldLabel={getSystemFieldLabel}
            isSystemFieldRequired={isSystemFieldRequired}
          />

          {/* Preview Section */}
          <DataPreviewTable
            fileColumns={fileColumns}
            sampleData={sampleData}
          />
        </div>

        <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex-row'}`}>
          <Button variant="outline" onClick={() => onOpenChange(false)} className={`${isMobile ? 'w-full' : ''}`}>
            ביטול
          </Button>
          <Button 
            onClick={() => handleConfirm(onConfirm)} 
            disabled={!hasRequiredMappings}
            className={`${isMobile ? 'w-full' : ''}`}
          >
            המשך לתצוגה מקדימה ({autoMappedCount} שדות ממופים)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
