
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { CustomFieldCreationSection } from './CustomFieldCreationSection';
import { FieldMappingList } from './field-mapping/FieldMappingList';
import { DataPreviewTable } from './field-mapping/DataPreviewTable';
import { FloatingAutoMappingMenu } from './field-mapping/FloatingAutoMappingMenu';
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
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  
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
    reapplyAutoMapping,
    clearAllMappings,
  } = useFieldMappingLogic({ 
    systemFields,
    fileColumns
  });

  // Show auto-detection status
  const autoMappedCount = mappings.filter(m => m.mappedColumns.length > 0).length;
  const totalRequiredFields = mappings.filter(m => isSystemFieldRequired(m.systemField)).length;
  const mappedRequiredFields = mappings.filter(m => isSystemFieldRequired(m.systemField) && m.mappedColumns.length > 0).length;

  const handleFloatingMenuFix = (systemField: string, newColumn: string) => {
    handleMappingChange(systemField, newColumn);
  };

  const handleDirectImport = () => {
    // Skip preview and go directly to import
    handleConfirm(onConfirm);
  };

  return (
    <>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFloatingMenuOpen(true)}
                className="mt-2"
              >
                פתח תפריט מיפוי מהיר
              </Button>
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

            {/* Preview Section - Smaller and less prominent */}
            <details className="border rounded-lg">
              <summary className="p-3 cursor-pointer bg-gray-50 rounded-lg text-sm font-medium">
                תצוגה מקדימה של הנתונים (לחץ להרחבה)
              </summary>
              <div className="p-3">
                <DataPreviewTable
                  fileColumns={fileColumns}
                  sampleData={sampleData}
                />
              </div>
            </details>
          </div>

          <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex-row'}`}>
            <Button variant="outline" onClick={() => onOpenChange(false)} className={`${isMobile ? 'w-full' : ''}`}>
              ביטול
            </Button>
            <Button 
              onClick={handleDirectImport}
              disabled={!hasRequiredMappings}
              className={`${isMobile ? 'w-full' : ''} bg-green-600 hover:bg-green-700`}
            >
              ייבא ישירות ({autoMappedCount} שדות ממופים)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Auto-Mapping Menu */}
      {open && (
        <FloatingAutoMappingMenu
          mappings={mappings}
          onReapplyAutoMapping={reapplyAutoMapping}
          onClearAllMappings={clearAllMappings}
          onFixMapping={handleFloatingMenuFix}
          fileColumns={fileColumns}
          isOpen={isFloatingMenuOpen}
          onToggle={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
        />
      )}
    </>
  );
};
