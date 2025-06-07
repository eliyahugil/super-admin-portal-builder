
import { FieldMapping } from '../types/FieldMappingTypes';

export const useFieldMappingAutoDetection = () => {
  const autoDetectMappings = (columns: string[]): FieldMapping[] => {
    const detectedMappings: FieldMapping[] = [];

    columns.forEach((column, index) => {
      const lowerColumn = column.toLowerCase().trim();
      let systemField = '';

      // Auto-detection logic
      if (lowerColumn.includes('שם') && (lowerColumn.includes('מלא') || lowerColumn.includes('שלם'))) {
        systemField = 'full_name';
      } else if (lowerColumn.includes('שם') && lowerColumn.includes('פרטי')) {
        systemField = 'first_name';
      } else if (lowerColumn.includes('שם') && lowerColumn.includes('משפחה')) {
        systemField = 'last_name';
      } else if (lowerColumn.includes('טלפון') || lowerColumn.includes('נייד')) {
        systemField = 'phone';
      } else if (lowerColumn.includes('מייל') || lowerColumn.includes('email')) {
        systemField = 'email';
      } else if (lowerColumn.includes('זהות')) {
        systemField = 'id_number';
      } else if (lowerColumn.includes('עובד') && lowerColumn.includes('מספר')) {
        systemField = 'employee_id';
      } else if (lowerColumn.includes('כתובת')) {
        systemField = 'address';
      } else if (lowerColumn.includes('תאריך') && lowerColumn.includes('תחילת')) {
        systemField = 'hire_date';
      } else if (lowerColumn.includes('סניף')) {
        systemField = 'branch_name';
      } else if (lowerColumn.includes('תפקיד')) {
        systemField = 'role';
      } else if (lowerColumn.includes('הערות')) {
        systemField = 'notes';
      }

      detectedMappings.push({
        id: `mapping-${index}`,
        systemField: systemField || '',
        mappedColumns: [column],
        isCustomField: !systemField,
        customFieldName: !systemField ? column : undefined,
      });
    });

    return detectedMappings;
  };

  return { autoDetectMappings };
};
