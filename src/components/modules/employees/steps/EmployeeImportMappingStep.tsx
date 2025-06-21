
import React from 'react';
import { FieldMappingDialog } from '../FieldMappingDialog';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface EmployeeImportMappingStepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  systemFields: Array<{ value: string; label: string }>;
}

export const EmployeeImportMappingStep: React.FC<EmployeeImportMappingStepProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  systemFields,
}) => {
  return (
    <FieldMappingDialog
      open={open}
      onOpenChange={onOpenChange}
      fileColumns={fileColumns}
      sampleData={sampleData}
      onConfirm={onConfirm}
      systemFields={systemFields}
    />
  );
};
