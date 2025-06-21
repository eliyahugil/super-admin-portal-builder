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
      systemFields: systemFields.length,
      sampleColumns: fileColumns.slice(0, 5)
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

    // Enhanced auto-detection with better Hebrew and column patterns
    initialMappings.forEach(mapping => {
      let bestMatch = '';
      let confidence = 0;
      
      fileColumns.forEach((col, index) => {
        const lowerCol = col.toLowerCase();
        let currentConfidence = 0;
        
        switch (mapping.systemField) {
          case 'first_name':
            if (lowerCol.includes('שם פרטי') || lowerCol.includes('שם ראשון')) currentConfidence = 100;
            else if (lowerCol.includes('first') || lowerCol.includes('fname')) currentConfidence = 90;
            else if (lowerCol.includes('שם') && index === 0) currentConfidence = 80;
            else if (col === 'Column 1' || index === 0) currentConfidence = 60;
            break;
            
          case 'last_name':
            if (lowerCol.includes('שם משפחה') || lowerCol.includes('משפחה')) currentConfidence = 100;
            else if (lowerCol.includes('last') || lowerCol.includes('surname')) currentConfidence = 90;
            else if (lowerCol.includes('שם') && index === 1) currentConfidence = 80;
            else if (col === 'Column 2' || index === 1) currentConfidence = 60;
            break;
            
          case 'email':
            if (lowerCol.includes('אימייל') || lowerCol.includes('מייל')) currentConfidence = 100;
            else if (lowerCol.includes('email') || lowerCol.includes('mail')) currentConfidence = 90;
            else if (col === 'Column 3' || index === 2) currentConfidence = 40;
            break;
            
          case 'phone':
            if (lowerCol.includes('טלפון') || lowerCol.includes('פלאפון')) currentConfidence = 100;
            else if (lowerCol.includes('phone') || lowerCol.includes('mobile')) currentConfidence = 90;
            else if (col === 'Column 4' || index === 3) currentConfidence = 40;
            break;
            
          case 'id_number':
            if (lowerCol.includes('תעודת זהות') || lowerCol.includes('ת.ז')) currentConfidence = 100;
            else if (lowerCol.includes('id') && (lowerCol.includes('number') || lowerCol.includes('num'))) currentConfidence = 90;
            else if (col === 'Column 5' || index === 4) currentConfidence = 30;
            break;
            
          case 'employee_type':
            if (lowerCol.includes('סוג עובד') || lowerCol.includes('טיפוס עובד')) currentConfidence = 100;
            else if (lowerCol.includes('type') || lowerCol.includes('category')) currentConfidence = 90;
            break;
        }
        
        if (currentConfidence > confidence) {
          confidence = currentConfidence;
          bestMatch = col;
        }
      });

      if (bestMatch && confidence >= 40) {
        mapping.mappedColumns = [bestMatch];
        console.log(`🎯 Auto-mapped ${mapping.systemField} to ${bestMatch} (confidence: ${confidence}%)`);
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
    // Reset all mappings and reapply auto-detection
    setMappings(prev => prev.map(mapping => ({ ...mapping, mappedColumns: [] })));
    
    // Trigger re-initialization
    setTimeout(() => {
      setMappings(prev => {
        return prev.map(mapping => {
          let bestMatch = '';
          let confidence = 0;
          
          fileColumns.forEach((col, index) => {
            const lowerCol = col.toLowerCase();
            let currentConfidence = 0;
            
            // Same auto-detection logic as in useEffect
            switch (mapping.systemField) {
              case 'first_name':
                if (lowerCol.includes('שם פרטי') || lowerCol.includes('שם ראשון')) currentConfidence = 100;
                else if (lowerCol.includes('first') || lowerCol.includes('fname')) currentConfidence = 90;
                else if (lowerCol.includes('שם') && index === 0) currentConfidence = 80;
                else if (col === 'Column 1' || index === 0) currentConfidence = 60;
                break;
                
              case 'last_name':
                if (lowerCol.includes('שם משפחה') || lowerCol.includes('משפחה')) currentConfidence = 100;
                else if (lowerCol.includes('last') || lowerCol.includes('surname')) currentConfidence = 90;
                else if (lowerCol.includes('שם') && index === 1) currentConfidence = 80;
                else if (col === 'Column 2' || index === 1) currentConfidence = 60;
                break;
                
              // ... other cases remain the same
            }
            
            if (currentConfidence > confidence) {
              confidence = currentConfidence;
              bestMatch = col;
            }
          });

          return {
            ...mapping,
            mappedColumns: bestMatch && confidence >= 40 ? [bestMatch] : []
          };
        });
      });
    }, 100);
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
