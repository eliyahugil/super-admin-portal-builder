
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
      applyAutoMappingsAndAddUnmapped();
    }
  }, [fileColumns, autoDetectMappings]);

  const applyAutoMappingsAndAddUnmapped = () => {
    console.log('🚀 Auto-detecting field mappings and adding unmapped columns:', fileColumns);
    
    const autoMappings = autoDetectMappings(fileColumns);
    console.log('🎯 Auto-detection found mappings:', autoMappings);
    
    // Track which columns were mapped
    const mappedColumns = new Set<string>();
    
    if (autoMappings.length > 0) {
      setMappings(prev => {
        const updatedMappings = prev.map(mapping => {
          const autoMapping = autoMappings.find(auto => auto.systemField === mapping.systemField);
          if (autoMapping && autoMapping.mappedColumns.length > 0) {
            console.log(`✅ Applied auto-mapping: ${mapping.systemField} ← ${autoMapping.mappedColumns.join(', ')}`);
            autoMapping.mappedColumns.forEach(col => mappedColumns.add(col));
            return {
              ...mapping,
              mappedColumns: autoMapping.mappedColumns,
            };
          }
          return mapping;
        });
        
        // Add unmapped columns as custom fields
        const unmappedColumns = fileColumns.filter(column => !mappedColumns.has(column));
        const customFieldMappings: FieldMapping[] = unmappedColumns.map((column, index) => ({
          id: `custom-${column}-${Date.now()}-${index}`,
          systemField: `custom_${column.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
          mappedColumns: [column],
          isRequired: false,
          label: `שדה מותאם: ${column}`,
          isCustomField: true,
        }));

        console.log(`📋 Added ${customFieldMappings.length} unmapped columns as custom fields:`, 
          customFieldMappings.map(m => m.label));
        
        const finalMappings = [...updatedMappings, ...customFieldMappings];
        
        console.log('📋 Final mappings after auto-detection and custom field addition:', 
          finalMappings.map(m => `${m.systemField}: ${m.mappedColumns.length > 0 ? m.mappedColumns.join(', ') : 'not mapped'}`));
        
        return finalMappings;
      });
    }
  };

  const reapplyAutoMapping = () => {
    console.log('🔄 Reapplying auto-mapping and adding unmapped fields...');
    applyAutoMappingsAndAddUnmapped();
  };

  const clearAllMappings = () => {
    console.log('🧹 Clearing all mappings...');
    setMappings(prev => prev.map(mapping => ({
      ...mapping,
      mappedColumns: [],
    })));
  };

  const removeUnmappedFields = () => {
    console.log('🗑️ Removing unmapped fields...');
    setMappings(prev => prev.filter(mapping => 
      mapping.mappedColumns.length > 0 || mapping.isRequired
    ));
  };

  const toggleFieldMapping = (mappingId: string) => {
    console.log('🔄 Toggling field mapping:', mappingId);
    setMappings(prev => prev.map(mapping => {
      if (mapping.id === mappingId) {
        return {
          ...mapping,
          mappedColumns: mapping.mappedColumns.length > 0 ? [] : [mapping.systemField]
        };
      }
      return mapping;
    }));
  };

  // Updated to handle multiple columns
  const handleMappingChange = (systemField: string, selectedColumns: string[]) => {
    console.log(`🗺️ Updating mapping for ${systemField} with columns:`, selectedColumns);
    setMappings(prev => prev.map(mapping => 
      mapping.systemField === systemField 
        ? { ...mapping, mappedColumns: selectedColumns }
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
    console.log('🎯 Confirming mappings:', validMappings.map(m => `${m.systemField} ← ${m.mappedColumns.join(', ')}`));
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
    reapplyAutoMapping,
    clearAllMappings,
    removeUnmappedFields,
    toggleFieldMapping,
  };
};
