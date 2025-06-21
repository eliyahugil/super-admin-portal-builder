
import { useState, useEffect } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { useFieldMappingAutoDetection } from '../hooks/useFieldMappingAutoDetection';

interface UseFieldMappingLogicProps {
  systemFields: Array<{ value: string; label: string; required?: boolean }>;
  fileColumns?: string[];
}

export const useFieldMappingLogic = ({ systemFields, fileColumns = [] }: UseFieldMappingLogicProps) => {
  const { autoDetectMappings } = useFieldMappingAutoDetection();
  
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

  // Auto-detect mappings when file columns are available
  useEffect(() => {
    if (fileColumns.length > 0) {
      console.log('🚀 Auto-detecting field mappings for file columns:', fileColumns);
      
      const autoMappings = autoDetectMappings(fileColumns);
      console.log('🎯 Auto-detection found mappings:', autoMappings);
      
      if (autoMappings.length > 0) {
        setMappings(prev => {
          const updatedMappings = prev.map(mapping => {
            const autoMapping = autoMappings.find(auto => auto.systemField === mapping.systemField);
            if (autoMapping) {
              console.log(`✅ Applied auto-mapping: ${mapping.systemField} ← ${autoMapping.mappedColumns[0]}`);
              return {
                ...mapping,
                mappedColumns: autoMapping.mappedColumns,
              };
            }
            return mapping;
          });
          
          console.log('📋 Final mappings after auto-detection:', updatedMappings.map(m => 
            `${m.systemField}: ${m.mappedColumns.length > 0 ? m.mappedColumns[0] : 'not mapped'}`
          ));
          
          return updatedMappings;
        });
      }
    }
  }, [fileColumns, autoDetectMappings]);

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
    console.log('🎯 Confirming mappings:', validMappings.map(m => `${m.systemField} ← ${m.mappedColumns[0]}`));
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
