
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FieldMappingDialogHeader } from './field-mapping/FieldMappingDialogHeader';
import { FieldMappingDialogTabs } from './field-mapping/FieldMappingDialogTabs';
import { FieldMappingDialogFooter } from './field-mapping/FieldMappingDialogFooter';
import { useFieldMappingLogic } from './field-mapping/useFieldMappingLogic';
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
    systemFieldsCount: systemFields?.length || 0,
    sampleColumns: fileColumns.slice(0, 3),
    sampleData: sampleData.slice(0, 1)
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

  const [activeTab, setActiveTab] = useState('mapping');

  const handleConfirm = () => {
    console.log('✅ FieldMappingDialog - confirming mappings:', {
      totalMappings: mappings.length,
      activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length,
      mappings: mappings.map(m => ({
        systemField: m.systemField,
        mappedColumns: m.mappedColumns,
        label: m.label
      }))
    });
    
    const validMappings = mappings.filter(mapping => 
      mapping.mappedColumns && mapping.mappedColumns.length > 0
    );
    
    console.log('📤 Sending valid mappings:', validMappings.length);
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
      const customMapping: FieldMapping = {
        id: `custom-${newField.value}-${Date.now()}`,
        systemField: newField.value,
        mappedColumns: [],
        isRequired: false,
        label: newField.label,
        isCustomField: true,
        customFieldName: newField.label,
      };
      
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
          hasAutoDetections={mappings.some(m => m.mappedColumns.length > 0)}
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
