
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

export interface PreviewCellData {
  value: string;
  isMultiColumn: boolean;
  sourceColumns: string[];
  isCustomField: boolean;
  isMapped?: boolean;
  isEmpty?: boolean;
}

export const generatePreviewData = (
  mappings: FieldMapping[],
  sampleData: any[]
): Record<string, any>[] => {
  console.log('🔄 PreviewDataGenerator - Processing data:', {
    mappingsCount: mappings.length,
    sampleDataCount: sampleData.length,
    activeMappings: mappings.filter(m => m.mappedColumns.length > 0).length
  });

  if (!sampleData || sampleData.length === 0) {
    return [];
  }

  return sampleData.slice(0, 5).map((row, rowIndex) => {
    const previewRow: Record<string, any> = {
      originalRowIndex: rowIndex
    };

    // Process each mapping
    mappings.forEach(mapping => {
      if (!mapping.mappedColumns || mapping.mappedColumns.length === 0) {
        return;
      }

      let combinedValue = '';
      const fieldValues: string[] = [];

      // Handle multiple columns for single field
      mapping.mappedColumns.forEach(columnName => {
        let columnValue = '';

        if (Array.isArray(row)) {
          // Find column index by name (assuming headers are available)
          const columnIndex = mapping.columnIndex;
          if (columnIndex !== undefined && columnIndex >= 0 && columnIndex < row.length) {
            const rawValue = row[columnIndex];
            columnValue = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
          }
        } else if (typeof row === 'object' && row !== null) {
          // Object format
          columnValue = row[columnName] ? String(row[columnName]).trim() : '';
        }

        if (columnValue) {
          fieldValues.push(columnValue);
        }
      });

      // Combine multiple values
      if (fieldValues.length > 0) {
        if (mapping.systemField === 'first_name' || mapping.systemField === 'last_name') {
          // For names, use first non-empty value
          combinedValue = fieldValues[0];
        } else if (mapping.systemField === 'address') {
          // For address, combine with commas
          combinedValue = fieldValues.join(', ');
        } else if (mapping.systemField === 'phone') {
          // For phone, use first valid value
          combinedValue = fieldValues[0];
        } else {
          // Default: combine with spaces
          combinedValue = fieldValues.join(' ');
        }
      }

      // Store the processed value
      previewRow[mapping.systemField] = {
        value: combinedValue,
        isMultiColumn: mapping.mappedColumns.length > 1,
        sourceColumns: mapping.mappedColumns,
        isCustomField: mapping.isCustomField || false
      };
    });

    return previewRow;
  });
};
