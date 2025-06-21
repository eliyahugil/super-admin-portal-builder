
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
      sample: Array.isArray(sampleData[0]) ? sampleData[0].slice(0, 3) : 'not array'
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
            // For array data - extract column index from name
            // Column names are either "Column 1", "Column 2" or the actual header values
            let columnIndex = -1;
            
            // Try to match by exact column name first (if it's a header from the file)
            const headerIndex = columnName.indexOf('Column ');
            if (headerIndex !== -1) {
              // Extract number from "Column X" format
              const indexMatch = columnName.match(/Column (\d+)/);
              if (indexMatch) {
                columnIndex = parseInt(indexMatch[1]) - 1; // Convert to 0-based
              }
            } else {
              // If it's not a "Column X" format, treat it as a direct header
              // We need to find which column index this header corresponds to
              // For now, let's assume the mapping system will handle this correctly
              console.log(`  ⚠️ Non-standard column name format: ${columnName}`);
              columnIndex = 0; // Fallback to first column
            }
            
            if (columnIndex >= 0 && columnIndex < row.length) {
              const rawValue = row[columnIndex];
              fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
              console.log(`  ✅ Array[${columnIndex}] = "${fieldValue}"`);
            } else {
              console.log(`  ❌ Array index ${columnIndex} out of bounds (length: ${row.length})`);
            }
          } else {
            console.log(`  ❌ Row is not array: ${typeof row}`);
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
