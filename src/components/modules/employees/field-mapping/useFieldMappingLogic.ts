
import { useState } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface UseFieldMappingLogicProps {
  systemFields: Array<{ value: string; label: string; required?: boolean }>;
}

export const useFieldMappingLogic = ({ systemFields }: UseFieldMappingLogicProps) => {
  const [mappings, setMappings] = useState<FieldMapping[]>(() => {
    return systemFields.map((field, index) => ({
      id: `mapping-${field.value}-${Date.now()}-${index}`,
      systemField: field.value,
      mappedColumns: [],
      isRequired: field.required || false,
      label: field.label,
      isCustomField: false,
    }));
  });

  const handleMappingChange = (systemField: string, selectedColumn: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.systemField === systemField 
        ? { ...mapping, mappedColumns: selectedColumn && selectedColumn !== 'none' ? [selectedColumn] : [] }
        : mapping
    ));
  };

  const handleAddCustomField = (customMapping: FieldMapping) => {
    setMappings(prev => [...prev, customMapping]);
  };

  const handleRemoveMapping = (mappingId: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
  };

  const handleMoveMapping = (mappingId: string, direction: 'up' | 'down') => {
    setMappings(prev => {
      const currentIndex = prev.findIndex(mapping => mapping.id === mappingId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newMappings = [...prev];
      [newMappings[currentIndex], newMappings[newIndex]] = [newMappings[newIndex], newMappings[currentIndex]];
      return newMappings;
    });
  };

  const getSystemFieldLabel = (systemField: string) => {
    const field = systemFields.find(f => f.value === systemField);
    return field?.label || systemField;
  };

  const isSystemFieldRequired = (systemField: string) => {
    const field = systemFields.find(f => f.value === systemField);
    return field?.required || false;
  };

  const hasRequiredMappings = mappings
    .filter(m => isSystemFieldRequired(m.systemField))
    .every(m => m.mappedColumns.length > 0);

  const handleConfirm = (onConfirm: (mappings: FieldMapping[]) => void) => {
    // Filter out mappings that have no columns mapped
    const validMappings = mappings.filter(mapping => mapping.mappedColumns.length > 0);
    onConfirm(validMappings);
  };

  return {
    mappings,
    handleMappingChange,
    handleAddCustomField,
    handleRemoveMapping,
    handleMoveMapping,
    getSystemFieldLabel,
    isSystemFieldRequired,
    hasRequiredMappings,
    handleConfirm,
  };
};
