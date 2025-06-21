
import { useState, useEffect } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import { useFieldMappingAutoDetection } from '../hooks/useFieldMappingAutoDetection';

interface UseFieldMappingLogicReturn {
  mappings: FieldMapping[];
  setMappings: (mappings: FieldMapping[]) => void;
  unmappedColumns: string[];
  mappedSystemFields: string[];
  addMapping: () => void;
  updateMapping: (mappingId: string, updates: Partial<FieldMapping>) => void;
  removeMapping: (mappingId: string) => void;
  canProceed: boolean;
  validationErrors: string[];
  reapplyAutoMapping: () => void;
  clearAllMappings: () => void;
  removeUnmappedFields: () => void;
  toggleFieldMapping: (mappingId: string) => void;
}

export const useFieldMappingLogic = (
  fileColumns: string[], 
  systemFields?: Array<{ value: string; label: string; required?: boolean }>
): UseFieldMappingLogicReturn => {
  const { autoDetectMappings } = useFieldMappingAutoDetection();
  
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  // Initialize with system fields or auto-detected mappings
  useEffect(() => {
    if (fileColumns.length > 0 && systemFields) {
      const autoMappings = autoDetectMappings(fileColumns);
      
      // Create mappings from system fields, filling with auto-detected ones where available
      const initialMappings = systemFields.map((field, index) => {
        const autoMapping = autoMappings.find(auto => auto.systemField === field.value);
        return {
          id: `mapping-${field.value}-${Date.now()}-${index}`,
          systemField: field.value,
          mappedColumns: autoMapping?.mappedColumns || [],
          isRequired: field.required || false,
          label: field.label,
          isCustomField: false,
        };
      });

      // Add unmapped columns as custom fields
      const mappedColumns = new Set<string>();
      autoMappings.forEach(mapping => {
        mapping.mappedColumns.forEach(col => mappedColumns.add(col));
      });
      
      const unmappedColumns = fileColumns.filter(column => !mappedColumns.has(column));
      const customFieldMappings: FieldMapping[] = unmappedColumns.map((column, index) => ({
        id: `custom-${column}-${Date.now()}-${index}`,
        systemField: `custom_${column.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
        mappedColumns: [column],
        isRequired: false,
        label: `שדה מותאם: ${column}`,
        isCustomField: true,
        customFieldName: column,
      }));

      setMappings([...initialMappings, ...customFieldMappings]);
    }
  }, [fileColumns, systemFields, autoDetectMappings]);

  const unmappedColumns = fileColumns.filter(column => 
    !mappings.some(mapping => mapping.mappedColumns.includes(column))
  );

  const mappedSystemFields = mappings
    .filter(mapping => mapping.mappedColumns.length > 0)
    .map(mapping => mapping.systemField);

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-new-${Date.now()}`,
      systemField: '',
      mappedColumns: [],
      isRequired: false,
      label: 'שדה חדש',
      isCustomField: false,
    };
    setMappings(prev => [...prev, newMapping]);
  };

  const updateMapping = (mappingId: string, updates: Partial<FieldMapping>) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === mappingId ? { ...mapping, ...updates } : mapping
    ));
  };

  const removeMapping = (mappingId: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
  };

  const reapplyAutoMapping = () => {
    if (fileColumns.length > 0) {
      const autoMappings = autoDetectMappings(fileColumns);
      setMappings(prev => prev.map(mapping => {
        const autoMapping = autoMappings.find(auto => auto.systemField === mapping.systemField);
        if (autoMapping) {
          return { ...mapping, mappedColumns: autoMapping.mappedColumns };
        }
        return mapping;
      }));
    }
  };

  const clearAllMappings = () => {
    setMappings(prev => prev.map(mapping => ({
      ...mapping,
      mappedColumns: [],
    })));
  };

  const removeUnmappedFields = () => {
    setMappings(prev => prev.filter(mapping => 
      mapping.mappedColumns.length > 0 || mapping.isRequired
    ));
  };

  const toggleFieldMapping = (mappingId: string) => {
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

  const validationErrors = mappings
    .filter(mapping => mapping.isRequired && mapping.mappedColumns.length === 0)
    .map(mapping => `השדה "${mapping.label}" הוא חובה וחייב להיות ממופה`);

  const canProceed = validationErrors.length === 0 && 
    mappings.some(mapping => mapping.mappedColumns.length > 0);

  return {
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
    toggleFieldMapping,
  };
};
