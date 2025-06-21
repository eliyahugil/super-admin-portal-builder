
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldMappingDialogHeader } from './field-mapping/FieldMappingDialogHeader';
import { FieldMappingDialogTabs } from './field-mapping/FieldMappingDialogTabs';
import { FieldMappingDialogFooter } from './field-mapping/FieldMappingDialogFooter';
import { useFieldMappingLogic } from './field-mapping/useFieldMappingLogic';
import { useFieldMappingAutoDetection } from './hooks/useFieldMappingAutoDetection';
import { SYSTEM_FIELDS } from '@/constants/systemFields';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  onBack?: () => void;
  systemFields?: Array<{ value: string; label: string }>;
}

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  onBack,
  systemFields = SYSTEM_FIELDS,
}) => {
  console.log('🗺️ FieldMappingDialog rendered with:', {
    open,
    fileColumnsCount: fileColumns.length,
    sampleDataCount: sampleData.length,
    systemFieldsCount: systemFields?.length || 0
  });

  const {
    mappings,
    setMappings,
    unmappedColumns,
    mappedSystemFields,
    addMapping,
    updateMapping,
    removeMapping,
    canProceed,
    validationErrors,
    reapplyAutoMapping,
    clearAllMappings,
    removeUnmappedFields,
  } = useFieldMappingLogic(fileColumns, systemFields);

  const {
    hasAutoDetections,
  } = useFieldMappingAutoDetection(fileColumns, systemFields);

  const [activeTab, setActiveTab] = useState('mapping');

  useEffect(() => {
    console.log('🔄 FieldMappingDialog - mappings updated:', {
      mappingsCount: mappings.length,
      canProceed,
      validationErrors: validationErrors.length
    });
  }, [mappings, canProceed, validationErrors]);

  const handleConfirm = () => {
    console.log('✅ FieldMappingDialog - confirming mappings:', mappings);
    const validMappings = mappings.filter(mapping => mapping.mappedColumns.length > 0);
    onConfirm(validMappings);
  };

  const handleBack = () => {
    console.log('⬅️ FieldMappingDialog - going back');
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  const handleAddSystemField = async (newField: { value: string; label: string }): Promise<boolean> => {
    try {
      console.log('➕ Adding new system field:', newField);
      // For now, just add it as a custom field - could be enhanced to save to database
      const customMapping: FieldMapping = {
        id: `custom-${newField.value}-${Date.now()}`,
        systemField: newField.value,
        mappedColumns: [],
        isRequired: false,
        label: newField.label,
        isCustomField: true,
        customFieldName: newField.label,
      };
      
      // Use direct value instead of callback
      setMappings([...mappings, customMapping]);
      return true;
    } catch (error) {
      console.error('Error adding system field:', error);
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <FieldMappingDialogHeader
          hasAutoDetections={hasAutoDetections}
          mappedCount={mappings.filter(m => m.mappedColumns.length > 0).length}
          totalColumns={fileColumns.length}
          onApplyAutoMapping={reapplyAutoMapping}
          onClearMappings={clearAllMappings}
          onRemoveUnmapped={removeUnmappedFields}
          onBack={handleBack}
        />

        <FieldMappingDialogTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mappings={mappings}
          fileColumns={fileColumns}
          sampleData={sampleData}
          systemFields={[...systemFields]}
          validationErrors={validationErrors}
          unmappedColumns={unmappedColumns}
          onUpdateMapping={updateMapping}
          onRemoveMapping={removeMapping}
          onAddSystemField={handleAddSystemField}
        />

        <FieldMappingDialogFooter
          mappings={mappings}
          fileColumns={fileColumns}
          canProceed={canProceed}
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
};
