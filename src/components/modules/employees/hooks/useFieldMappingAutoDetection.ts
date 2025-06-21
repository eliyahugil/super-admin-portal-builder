
import { useCallback } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

export const useFieldMappingAutoDetection = () => {
  const autoDetectMappings = useCallback((fileColumns: string[]): FieldMapping[] => {
    console.log('🔍 Auto-detecting mappings for columns:', fileColumns);
    
    const mappings: FieldMapping[] = [];

    // Enhanced auto-detection rules with support for multiple columns per field
    const detectionRules = [
      { 
        patterns: [
          /^(שם פרטי|שם ראשי|שם|first.?name|firstname|name|fname|given.?name|פרטי)$/i,
          /^(first|name1|column.*1|עמודה.*1)$/i
        ], 
        field: 'first_name', 
        label: 'שם פרטי', 
        required: true 
      },
      { 
        patterns: [
          /^(שם משפחה|משפחה|last.?name|lastname|surname|family.?name|lname|אחרון)$/i,
          /^(last|name2|column.*2|עמודה.*2)$/i
        ], 
        field: 'last_name', 
        label: 'שם משפחה', 
        required: true 
      },
      { 
        patterns: [
          /^(אימייל|מייל|email|mail|e.?mail|אי.?מייל)$/i,
          /^(column.*3|עמודה.*3)$/i
        ], 
        field: 'email', 
        label: 'אימייל', 
        required: false 
      },
      { 
        patterns: [
          /^(טלפון|פלאפון|נייד|mobile|phone|cell|cellular|tel|טל|נייד)$/i,
          /^(column.*4|עמודה.*4)$/i
        ], 
        field: 'phone', 
        label: 'טלפון', 
        required: false 
      },
      { 
        patterns: [
          /^(תעודת זהות|ת\.ז|תז|id.?number|identity|national.?id|citizen.?id|תעודה)$/i,
          /^(column.*5|עמודה.*5)$/i
        ], 
        field: 'id_number', 
        label: 'תעודת זהות', 
        required: false 
      },
      { 
        patterns: [
          /^(מספר עובד|מס עובד|עובד|employee.?id|emp.?id|worker.?id|staff.?id|מס)$/i,
          /^(column.*6|עמודה.*6)$/i
        ], 
        field: 'employee_id', 
        label: 'מספר עובד', 
        required: false 
      },
      { 
        patterns: [
          /^(כתובת|מען|address|addr|location|מיקום)$/i,
          /^(column.*7|עמודה.*7)$/i
        ], 
        field: 'address', 
        label: 'כתובת', 
        required: false 
      },
      { 
        patterns: [
          /^(תאריך התחלה|תחילת עבודה|התחלה|hire.?date|start.?date|employment.?date|join.?date|תחילה)$/i,
          /^(column.*8|עמודה.*8)$/i
        ], 
        field: 'hire_date', 
        label: 'תאריך התחלה', 
        required: false 
      },
      { 
        patterns: [
          /^(סוג עובד|טיפוס עובד|קטגוריה|employee.?type|worker.?type|type|category|classification|סוג)$/i,
          /^(column.*9|עמודה.*9)$/i
        ], 
        field: 'employee_type', 
        label: 'סוג עובד', 
        required: false 
      },
      { 
        patterns: [
          /^(שעות שבועיות|שעות|hours|weekly.?hours|work.?hours|שבועי)$/i,
          /^(column.*10|עמודה.*10)$/i
        ], 
        field: 'weekly_hours_required', 
        label: 'שעות שבועיות', 
        required: false 
      },
      { 
        patterns: [
          /^(סניף|מחלקה|branch|department|dept|division|unit|מחלקת)$/i,
          /^(column.*11|עמודה.*11)$/i
        ], 
        field: 'main_branch_id', 
        label: 'סניף ראשי', 
        required: false 
      },
      { 
        patterns: [
          /^(הערות|הערה|notes|remarks|comment|comments|description|תיאור)$/i,
          /^(column.*12|עמודה.*12)$/i
        ], 
        field: 'notes', 
        label: 'הערות', 
        required: false 
      },
    ];

    // Track used columns for each field (now supporting multiple columns per field)
    const fieldMappings = new Map<string, string[]>();

    fileColumns.forEach((column, columnIndex) => {
      console.log(`🔍 Checking column "${column}" (index: ${columnIndex})`);
      
      // Clean the column name for better matching
      const cleanColumn = column.toString().trim();
      
      const matchedRule = detectionRules.find(rule => {
        // Check against all patterns for this rule
        const isMatch = rule.patterns.some(pattern => {
          const match = pattern.test(cleanColumn);
          if (match) {
            console.log(`  - Pattern match: "${cleanColumn}" matches pattern for ${rule.field}`);
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
    fieldMappings.forEach((columns, field) => {
      const rule = detectionRules.find(r => r.field === field);
      if (rule) {
        mappings.push({
          id: `auto-${field}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          systemField: field,
          mappedColumns: columns, // Now supports multiple columns
          isRequired: rule.required,
          label: rule.label,
          isCustomField: false,
        });
      }
    });

    console.log('🎯 Auto-detection results:', {
      totalColumns: fileColumns.length,
      mappedFields: mappings.length,
      mappings: mappings.map(m => `${m.systemField} ← ${m.mappedColumns.join(', ')}`)
    });

    return mappings;
  }, []);

  return { autoDetectMappings };
};
