
import { useCallback } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

export const useFieldMappingAutoDetection = () => {
  const autoDetectMappings = useCallback((fileColumns: string[]): FieldMapping[] => {
    const mappings: FieldMapping[] = [];

    // Auto-detection rules based on common Hebrew/English column names
    const detectionRules = [
      { pattern: /שם פרטי|first.?name|firstname/i, field: 'first_name' },
      { pattern: /שם משפחה|last.?name|lastname|surname/i, field: 'last_name' },
      { pattern: /אימייל|email|mail/i, field: 'email' },
      { pattern: /טלפון|phone|פלאפון|נייד|mobile/i, field: 'phone' },
      { pattern: /תעודת זהות|id.?number|identity|ת\.ז/i, field: 'id_number' },
      { pattern: /מספר עובד|employee.?id|emp.?id/i, field: 'employee_id' },
      { pattern: /כתובת|address|מען/i, field: 'address' },
      { pattern: /תאריך התחלה|hire.?date|start.?date/i, field: 'hire_date' },
      { pattern: /סוג עובד|employee.?type|type/i, field: 'employee_type' },
      { pattern: /שעות|hours|weekly/i, field: 'weekly_hours_required' },
      { pattern: /סניף|branch|מחלקה/i, field: 'main_branch_id' },
      { pattern: /הערות|notes|remarks|comment/i, field: 'notes' },
    ];

    fileColumns.forEach((column) => {
      const matchedRule = detectionRules.find(rule => rule.pattern.test(column));
      if (matchedRule) {
        // Check if this system field is already mapped
        const existingMapping = mappings.find(m => m.systemField === matchedRule.field);
        if (existingMapping) {
          // Add to existing mapping if not already there
          if (!existingMapping.mappedColumns.includes(column)) {
            existingMapping.mappedColumns.push(column);
          }
        } else {
          // Create new mapping
          mappings.push({
            id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            systemField: matchedRule.field,
            mappedColumns: [column],
            isCustomField: false,
          });
        }
      }
    });

    return mappings;
  }, []);

  return { autoDetectMappings };
};
