
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
      length: Array.isArray(sampleData[0]) ? sampleData[0].length : 'not array',
      sample: Array.isArray(sampleData[0]) ? sampleData[0].slice(0, 5) : 'not array'
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
      rowLength: Array.isArray(row) ? row.length : 'not array',
      rowContent: Array.isArray(row) ? row.slice(0, 5) : 'not array'
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
            // For array data - we need to find the correct column index
            // The column name should match exactly with the header from the file
            console.log(`🔍 Looking for column: "${columnName}" in row with ${row.length} items`);
            
            // Since we're dealing with Excel data as arrays, we need to get the column index
            // The columnName should be the actual header text, not "Column X"
            // We need to find which index this header corresponds to
            
            // For now, let's try a direct approach - if the mapping was created correctly,
            // the columnName should correspond to a specific index
            
            // Get all available headers (this should come from the file processing)
            // For now, let's log what we have and try to match
            
            let columnIndex = -1;
            
            // If columnName is something like "First Name", we need to find its index
            // This should be provided by the mapping logic
            if (mapping.columnIndex !== undefined) {
              columnIndex = mapping.columnIndex;
            } else {
              // Fallback - try to parse if it's in "Column X" format
              const columnMatch = columnName.match(/^Column (\d+)$/);
              if (columnMatch) {
                columnIndex = parseInt(columnMatch[1]) - 1; // Convert to 0-based
              } else {
                // If we don't have the index, we can't map properly
                console.error(`❌ Cannot determine column index for: ${columnName}`);
                return;
              }
            }
            
            if (columnIndex >= 0 && columnIndex < row.length) {
              const rawValue = row[columnIndex];
              fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
              console.log(`✅ Found value at index ${columnIndex}: "${fieldValue}"`);
            } else {
              console.log(`❌ Column index ${columnIndex} out of bounds (row length: ${row.length})`);
            }
          } else {
            console.log(`❌ Row is not array: ${typeof row}`);
          }
          
          if (fieldValue && fieldValue !== '') {
            values.push(fieldValue);
          }
        } catch (error) {
          console.error(`💥 Error accessing ${columnName}:`, error);
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
