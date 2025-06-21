
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

export interface PreviewRowData {
  originalRowIndex: number;
  [key: string]: any;
}

export interface PreviewCellData {
  value: string;
  originalValue: string;
  isMapped: boolean;
  isEmpty: boolean;
  mappedColumns: string[];
}

export const generatePreviewData = (
  mappings: FieldMapping[], 
  sampleData: any[]
): PreviewRowData[] => {
  console.log('🔄 generatePreviewData - Starting with:', {
    mappingsCount: mappings.length,
    sampleDataCount: sampleData.length,
    firstMapping: mappings[0] ? {
      systemField: mappings[0].systemField,
      mappedColumns: mappings[0].mappedColumns
    } : 'No mappings',
    firstRowData: sampleData[0] ? {
      type: typeof sampleData[0],
      isArray: Array.isArray(sampleData[0]),
      keys: Array.isArray(sampleData[0]) ? `Array with ${sampleData[0].length} items` : Object.keys(sampleData[0] || {}).slice(0, 5)
    } : 'No data'
  });

  if (!mappings.length || !sampleData.length) {
    console.log('❌ No mappings or data available');
    return [];
  }

  // Take first 5 rows for preview
  const dataToProcess = sampleData.slice(0, 5);
  
  return dataToProcess.map((row, rowIndex) => {
    console.log(`📋 Processing row ${rowIndex + 1}:`, {
      rowType: typeof row,
      isArray: Array.isArray(row),
      rowContent: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row || {}).slice(0, 3)
    });

    const mappedRow: Record<string, PreviewCellData> = {};
    
    mappings.forEach((mapping) => {
      console.log(`🗺️ Processing mapping: ${mapping.systemField} <- [${mapping.mappedColumns?.join(', ') || 'none'}]`);
      
      if (!mapping.systemField || !mapping.mappedColumns || mapping.mappedColumns.length === 0) {
        console.log(`⚠️ Skipping invalid mapping for: ${mapping.systemField}`);
        return;
      }

      const values: string[] = [];
      
      mapping.mappedColumns.forEach(columnName => {
        let fieldValue = '';
        
        try {
          if (Array.isArray(row)) {
            // For array data - extract column index from name
            const indexMatch = columnName.match(/(\d+)/);
            if (indexMatch) {
              const columnIndex = parseInt(indexMatch[1]) - 1; // Convert to 0-based
              if (columnIndex >= 0 && columnIndex < row.length) {
                fieldValue = String(row[columnIndex] || '').trim();
                console.log(`  ✅ Array[${columnIndex}] = "${fieldValue}"`);
              } else {
                console.log(`  ❌ Array index ${columnIndex} out of bounds (length: ${row.length})`);
              }
            } else {
              console.log(`  ❌ Could not extract index from column name: ${columnName}`);
            }
          } else if (row && typeof row === 'object') {
            // For object data - direct property access
            fieldValue = String(row[columnName] || '').trim();
            console.log(`  ✅ Object["${columnName}"] = "${fieldValue}"`);
          } else {
            console.log(`  ❌ Row is not array or object: ${typeof row}`);
          }
          
          if (fieldValue && fieldValue !== '') {
            values.push(fieldValue);
          }
        } catch (error) {
          console.error(`  💥 Error accessing ${columnName}:`, error);
        }
      });
      
      const combinedValue = values.length > 1 ? values.join(' ') : (values[0] || '');
      
      console.log(`📝 Final mapping result: ${mapping.systemField} = "${combinedValue}" (from ${values.length} values)`);
      
      mappedRow[mapping.systemField] = {
        value: combinedValue || '-',
        originalValue: combinedValue || '-',
        isMapped: true,
        isEmpty: !combinedValue,
        mappedColumns: mapping.mappedColumns
      };
    });

    console.log(`✅ Row ${rowIndex + 1} processed with ${Object.keys(mappedRow).length} mapped fields`);

    return {
      originalRowIndex: rowIndex + 1,
      ...mappedRow,
    };
  });
};

export const getSystemFieldLabel = (
  mapping: FieldMapping, 
  systemFields: Array<{ value: string; label: string }>
): string => {
  if (mapping.isCustomField && mapping.customFieldName) {
    return mapping.customFieldName;
  }
  
  const field = systemFields.find(f => f.value === mapping.systemField);
  return field ? field.label : mapping.systemField;
};
