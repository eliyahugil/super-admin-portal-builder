
import { useState, useEffect, useCallback } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface UseFieldMappingLogicProps {
  fileColumns: string[];
  systemFields: Array<{ value: string; label: string }>;
}

export const useFieldMappingLogic = (
  fileColumns: string[],
  systemFields: Array<{ value: string; label: string }>
) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  // Initialize mappings with basic system fields
  useEffect(() => {
    console.log('🔄 Initializing field mappings with:', {
      fileColumns: fileColumns.length,
      systemFields: systemFields.length
    });

    const initialMappings: FieldMapping[] = [
      {
        id: 'first_name',
        systemField: 'first_name',
        mappedColumns: [],
        isRequired: true,
        label: 'שם פרטי'
      },
      {
        id: 'last_name',
        systemField: 'last_name',
        mappedColumns: [],
        isRequired: true,
        label: 'שם משפחה'
      },
      {
        id: 'email',
        systemField: 'email',
        mappedColumns: [],
        isRequired: false,
        label: 'אימייל'
      },
      {
        id: 'phone',
        systemField: 'phone',
        mappedColumns: [],
        isRequired: false,
        label: 'טלפון'
      },
      {
        id: 'id_number',
        systemField: 'id_number',
        mappedColumns: [],
        isRequired: false,
        label: 'תעודת זהות'
      },
      {
        id: 'employee_type',
        systemField: 'employee_type',
        mappedColumns: [],
        isRequired: false,
        label: 'סוג עובד'
      }
    ];

    // Auto-detect common mappings
    initialMappings.forEach(mapping => {
      const possibleColumns = fileColumns.filter(col => {
        const lowerCol = col.toLowerCase();
        switch (mapping.systemField) {
          case 'first_name':
            return lowerCol.includes('שם פרטי') || lowerCol.includes('first') || lowerCol.includes('name') && lowerCol.includes('first');
          case 'last_name':
            return lowerCol.includes('שם משפחה') || lowerCol.includes('last') || lowerCol.includes('surname') || lowerCol.includes('family');
          case 'email':
            return lowerCol.includes('אימייל') || lowerCol.includes('email') || lowerCol.includes('mail');
          case 'phone':
            return lowerCol.includes('טלפון') || lowerCol.includes('phone') || lowerCol.includes('mobile') || lowerCol.includes('tel');
          case 'id_number':
            return lowerCol.includes('ת.ז') || lowerCol.includes('תעודת זהות') || lowerCol.includes('id') || lowerCol.includes('identity');
          case 'employee_type':
            return lowerCol.includes('סוג עובד') || lowerCol.includes('type') || lowerCol.includes('category');
          default:
            return false;
        }
      });

      if (possibleColumns.length > 0) {
        mapping.mappedColumns = [possibleColumns[0]];
        console.log(`🎯 Auto-mapped ${mapping.systemField} to ${possibleColumns[0]}`);
      }
    });

    setMappings(initialMappings);
  }, [fileColumns, systemFields]);

  const updateMapping = useCallback((mappingId: string, updates: Partial<FieldMapping>) => {
    console.log('🔄 Updating mapping:', mappingId, updates);
    setMappings(prev => prev.map(m => 
      m.id === mappingId ? { ...m, ...updates } : m
    ));
  }, []);

  const addMapping = useCallback((newMapping: FieldMapping) => {
    console.log('➕ Adding new mapping:', newMapping);
    setMappings(prev => [...prev, newMapping]);
  }, []);

  const removeMapping = useCallback((mappingId: string) => {
    console.log('🗑️ Removing mapping:', mappingId);
    setMappings(prev => prev.filter(m => m.id !== mappingId));
  }, []);

  const reapplyAutoMapping = useCallback(() => {
    console.log('🔄 Reapplying auto-mapping');
    setMappings(prev => prev.map(mapping => {
      const possibleColumns = fileColumns.filter(col => {
        const lowerCol = col.toLowerCase();
        switch (mapping.systemField) {
          case 'first_name':
            return lowerCol.includes('שם פרטי') || lowerCol.includes('first') || (lowerCol.includes('name') && lowerCol.includes('first'));
          case 'last_name':
            return lowerCol.includes('שם משפחה') || lowerCol.includes('last') || lowerCol.includes('surname') || lowerCol.includes('family');
          case 'email':
            return lowerCol.includes('אימייל') || lowerCol.includes('email') || lowerCol.includes('mail');
          case 'phone':
            return lowerCol.includes('טלפון') || lowerCol.includes('phone') || lowerCol.includes('mobile') || lowerCol.includes('tel');
          case 'id_number':
            return lowerCol.includes('ת.ז') || lowerCol.includes('תעודת זהות') || lowerCol.includes('id') || lowerCol.includes('identity');
          case 'employee_type':
            return lowerCol.includes('סוג עובד') || lowerCol.includes('type') || lowerCol.includes('category');
          default:
            return false;
        }
      });

      return {
        ...mapping,
        mappedColumns: possibleColumns.length > 0 ? [possibleColumns[0]] : []
      };
    }));
  }, [fileColumns]);

  const clearAllMappings = useCallback(() => {
    console.log('🧹 Clearing all mappings');
    setMappings(prev => prev.map(m => ({ ...m, mappedColumns: [] })));
  }, []);

  const removeUnmappedFields = useCallback(() => {
    console.log('🗑️ Removing unmapped fields');
    setMappings(prev => prev.filter(m => m.mappedColumns.length > 0));
  }, []);

  // Calculate derived state
  const mappedSystemFields = mappings.filter(m => m.mappedColumns.length > 0).map(m => m.systemField);
  const unmappedColumns = fileColumns.filter(col => 
    !mappings.some(m => m.mappedColumns.includes(col))
  );

  const validationErrors: string[] = [];
  const requiredMappings = mappings.filter(m => m.isRequired);
  const missingRequired = requiredMappings.filter(m => m.mappedColumns.length === 0);
  
  if (missingRequired.length > 0) {
    validationErrors.push(`שדות חובה חסרים: ${missingRequired.map(m => m.label).join(', ')}`);
  }

  const canProceed = validationErrors.length === 0 && mappings.some(m => m.mappedColumns.length > 0);

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
  };
};
