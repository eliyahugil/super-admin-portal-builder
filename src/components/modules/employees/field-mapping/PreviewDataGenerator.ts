
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
  // Take first 5 rows for preview
  const dataToProcess = sampleData.slice(0, 5);
  
  console.log('📊 generatePreviewData - Processing data:', {
    totalRows: dataToProcess.length,
    mappingsCount: mappings.length,
    firstRowSample: dataToProcess[0] ? {
      isArray: Array.isArray(dataToProcess[0]),
      keys: Array.isArray(dataToProcess[0]) ? 
        `Array length: ${dataToProcess[0].length}` : 
        Object.keys(dataToProcess[0]).slice(0, 5)
    } : 'No data'
  });
  
  return dataToProcess.map((row, rowIndex) => {
    console.log(`📋 Processing row ${rowIndex + 1}:`, {
      rowData: Array.isArray(row) ? row.slice(0, 3) : Object.entries(row || {}).slice(0, 3)
    });

    const mappedRow: Record<string, PreviewCellData> = {};
    
    mappings.forEach((mapping) => {
      if (mapping.systemField && mapping.mappedColumns && mapping.mappedColumns.length > 0) {
        const values: string[] = [];
        
        mapping.mappedColumns.forEach(columnName => {
          let fieldValue;
          
          if (Array.isArray(row)) {
            // For array data, convert column name to index
            const columnIndex = parseInt(columnName.replace(/\D/g, ''), 10) - 1;
            if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < row.length) {
              fieldValue = row[columnIndex];
              console.log(`  Array access: Column "${columnName}" -> Index ${columnIndex} -> Value: "${fieldValue}"`);
            } else {
              console.log(`  Array access failed: Column "${columnName}" -> Index ${columnIndex} (out of bounds)`);
            }
          } else if (typeof row === 'object' && row !== null) {
            // For object data, direct property access
            fieldValue = row[columnName];
            console.log(`  Object access: "${columnName}" -> "${fieldValue}"`);
          }
          
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            const cleanValue = String(fieldValue).trim();
            if (cleanValue) {
              values.push(cleanValue);
            }
          }
        });
        
        const combinedValue = values.length > 1 ? values.join(' ') : (values[0] || '');
        console.log(`🗺️ Final mapping: ${mapping.systemField} <- [${mapping.mappedColumns.join(', ')}] = "${combinedValue}"`);
        
        mappedRow[mapping.systemField] = {
          value: combinedValue || '-',
          originalValue: combinedValue || '-',
          isMapped: true,
          isEmpty: !combinedValue,
          mappedColumns: mapping.mappedColumns
        };
      }
    });

    console.log(`✅ Row ${rowIndex + 1} mapped result:`, {
      fieldsCount: Object.keys(mappedRow).length,
      fields: Object.keys(mappedRow).map(key => `${key}: "${mappedRow[key]?.value}"`).slice(0, 3)
    });

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
