
import { useCallback } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface UseFieldMappingAutoDetectionReturn {
  autoDetectMappings: (fileColumns: string[]) => FieldMapping[];
  autoDetectedMappings: FieldMapping[];
  applyAutoDetection: (mappings: FieldMapping[]) => void;
  hasAutoDetections: boolean;
}

export const useFieldMappingAutoDetection = (
  fileColumns?: string[], 
  systemFields?: Array<{ value: string; label: string }>
): UseFieldMappingAutoDetectionReturn => {
  
  const autoDetectMappings = useCallback((columns: string[]): FieldMapping[] => {
    console.log('🔍 Auto-detecting mappings for columns:', columns);
    
    const mappings: FieldMapping[] = [];

    // Enhanced auto-detection rules with better support for generic column names
    const detectionRules = [
      { 
        patterns: [
          /^(שם פרטי|שם ראשון|שם|first.?name|firstname|name|fname|given.?name|פרטי|ראשון)$/i,
          /^(column.*1|עמודה.*1|col.*1|c1)$/i,
          /^(a|1)$/i
        ], 
        field: 'first_name', 
        label: 'שם פרטי', 
        required: true 
      },
      { 
        patterns: [
          /^(שם משפחה|משפחה|last.?name|lastname|surname|family.?name|lname|אחרון)$/i,
          /^(column.*2|עמודה.*2|col.*2|c2)$/i,
          /^(b|2)$/i
        ], 
        field: 'last_name', 
        label: 'שם משפחה', 
        required: true 
      },
      { 
        patterns: [
          /^(אימייל|מייל|email|mail|e.?mail|אי.?מייל|דוא"ל|דואל)$/i,
          /^(column.*3|עמודה.*3|col.*3|c3)$/i,
          /^(c|3)$/i
        ], 
        field: 'email', 
        label: 'אימייל', 
        required: false 
      },
      { 
        patterns: [
          /^(טלפון|פלאפון|נייד|mobile|phone|cell|cellular|tel|טל|פלא|סלולרי)$/i,
          /^(column.*4|עמודה.*4|col.*4|c4)$/i,
          /^(d|4)$/i
        ], 
        field: 'phone', 
        label: 'טלפון', 
        required: false 
      },
      { 
        patterns: [
          /^(תעודת זהות|ת\.ז|תז|id.?number|identity|national.?id|citizen.?id|תעודה|זהות)$/i,
          /^(column.*5|עמודה.*5|col.*5|c5)$/i,
          /^(e|5)$/i
        ], 
        field: 'id_number', 
        label: 'תעודת זהות', 
        required: false 
      },
      { 
        patterns: [
          /^(מספר עובד|מס עובד|עובד|employee.?id|emp.?id|worker.?id|staff.?id|מס|קוד עובד)$/i,
          /^(column.*6|עמודה.*6|col.*6|c6)$/i,
          /^(f|6)$/i
        ], 
        field: 'employee_id', 
        label: 'מספר עובד', 
        required: false 
      },
      { 
        patterns: [
          /^(כתובת|מען|address|addr|location|מיקום|רחוב)$/i,
          /^(column.*7|עמודה.*7|col.*7|c7)$/i,
          /^(g|7)$/i
        ], 
        field: 'address', 
        label: 'כתובת', 
        required: false 
      },
      { 
        patterns: [
          /^(תאריך התחלה|תחילת עבודה|התחלה|hire.?date|start.?date|employment.?date|join.?date|תחילה|תחל|חל)$/i,
          /^(column.*8|עמודה.*8|col.*8|c8)$/i,
          /^(h|8)$/i
        ], 
        field: 'hire_date', 
        label: 'תאריך התחלה', 
        required: false 
      },
      { 
        patterns: [
          /^(סוג עובד|טיפוס עובד|קטגוריה|employee.?type|worker.?type|type|category|classification|סוג|טיפוס)$/i,
          /^(column.*9|עמודה.*9|col.*9|c9)$/i,
          /^(i|9)$/i
        ], 
        field: 'employee_type', 
        label: 'סוג עובד', 
        required: false 
      },
      { 
        patterns: [
          /^(שעות שבועיות|שעות|hours|weekly.?hours|work.?hours|שבועי|שבועית)$/i,
          /^(column.*10|עמודה.*10|col.*10|c10)$/i,
          /^(j|10)$/i
        ], 
        field: 'weekly_hours_required', 
        label: 'שעות שבועיות', 
        required: false 
      },
      { 
        patterns: [
          /^(סניף|מחלקה|branch|department|dept|division|unit|מחלקת|ענף)$/i,
          /^(column.*11|עמודה.*11|col.*11|c11)$/i,
          /^(k|11)$/i
        ], 
        field: 'main_branch_id', 
        label: 'סניף ראשי', 
        required: false 
      },
      { 
        patterns: [
          /^(הערות|הערה|notes|remarks|comment|comments|description|תיאור|הרות)$/i,
          /^(column.*12|עמודה.*12|col.*12|c12)$/i,
          /^(l|12)$/i
        ], 
        field: 'notes', 
        label: 'הערות', 
        required: false 
      },
    ];

    // Track used columns for each field
    const fieldMappings = new Map<string, string[]>();

    columns.forEach((column, columnIndex) => {
      // Skip null or undefined columns
      if (!column || column === null || column === undefined) {
        console.log(`⏭️ Skipping null/undefined column at index ${columnIndex}`);
        return;
      }

      console.log(`🔍 Checking column "${column}" (index: ${columnIndex})`);
      
      // Clean the column name for better matching
      const cleanColumn = column.toString().trim().toLowerCase();
      
      const matchedRule = detectionRules.find(rule => {
        // Check against all patterns for this rule
        const isMatch = rule.patterns.some(pattern => {
          const match = pattern.test(cleanColumn) || pattern.test(column);
          if (match) {
            console.log(`  - ✅ Pattern match: "${column}" matches pattern for ${rule.field}`);
          }
          return match;
        });
        
        console.log(`  - Testing against ${rule.field}: ${isMatch ? '✅ MATCH' : '❌ no match'}`);
        return isMatch;
      });
      
      if (matchedRule) {
        console.log(`✅ Auto-mapped: "${column}" → ${matchedRule.field}`);
        
        // Add column to the field's mapping list
        if (!fieldMappings.has(matchedRule.field)) {
          fieldMappings.set(matchedRule.field, []);
        }
        fieldMappings.get(matchedRule.field)!.push(column);
      } else {
        console.log(`❌ No match found for column "${column}"`);
      }
    });

    // Create mappings from the collected field mappings
    fieldMappings.forEach((cols, field) => {
      const rule = detectionRules.find(r => r.field === field);
      if (rule) {
        mappings.push({
          id: `auto-${field}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          systemField: field,
          mappedColumns: cols,
          isRequired: rule.required,
          label: rule.label,
          isCustomField: false,
        });
      }
    });

    console.log('🎯 Auto-detection results:', {
      totalColumns: columns.length,
      validColumns: columns.filter(col => col !== null && col !== undefined).length,
      mappedFields: mappings.length,
      mappings: mappings.map(m => `${m.systemField} ← ${m.mappedColumns.join(', ')}`)
    });

    return mappings;
  }, []);

  const autoDetectedMappings = fileColumns ? autoDetectMappings(fileColumns) : [];
  const hasAutoDetections = autoDetectedMappings.length > 0;

  const applyAutoDetection = (mappings: FieldMapping[]) => {
    console.log('🔄 Applying auto-detection to existing mappings');
    // This would be handled by the parent component
  };

  return {
    autoDetectMappings,
    autoDetectedMappings,
    applyAutoDetection,
    hasAutoDetections,
  };
};
