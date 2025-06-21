
import { useCallback } from 'react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

export const useFieldMappingAutoDetection = () => {
  const autoDetectMappings = useCallback((fileColumns: string[]): FieldMapping[] => {
    console.log('🔍 Auto-detecting mappings for columns:', fileColumns);
    
    const mappings: FieldMapping[] = [];

    // Enhanced auto-detection rules with more patterns
    const detectionRules = [
      { 
        pattern: /^(שם פרטי|שם ראשי|שם|first.?name|firstname|name|fname|given.?name)$/i, 
        field: 'first_name', 
        label: 'שם פרטי', 
        required: true 
      },
      { 
        pattern: /^(שם משפחה|משפחה|last.?name|lastname|surname|family.?name|lname)$/i, 
        field: 'last_name', 
        label: 'שם משפחה', 
        required: true 
      },
      { 
        pattern: /^(אימייל|מייל|email|mail|e.?mail)$/i, 
        field: 'email', 
        label: 'אימייל', 
        required: false 
      },
      { 
        pattern: /^(טלפון|פלאפון|נייד|mobile|phone|cell|cellular|tel)$/i, 
        field: 'phone', 
        label: 'טלפון', 
        required: false 
      },
      { 
        pattern: /^(תעודת זהות|ת\.ז|תז|id.?number|identity|national.?id|citizen.?id)$/i, 
        field: 'id_number', 
        label: 'תעודת זהות', 
        required: false 
      },
      { 
        pattern: /^(מספר עובד|מס עובד|עובד|employee.?id|emp.?id|worker.?id|staff.?id)$/i, 
        field: 'employee_id', 
        label: 'מספר עובד', 
        required: false 
      },
      { 
        pattern: /^(כתובת|מען|address|addr|location)$/i, 
        field: 'address', 
        label: 'כתובת', 
        required: false 
      },
      { 
        pattern: /^(תאריך התחלה|תחילת עבודה|התחלה|hire.?date|start.?date|employment.?date|join.?date)$/i, 
        field: 'hire_date', 
        label: 'תאריך התחלה', 
        required: false 
      },
      { 
        pattern: /^(סוג עובד|טיפוס עובד|קטגוריה|employee.?type|worker.?type|type|category|classification)$/i, 
        field: 'employee_type', 
        label: 'סוג עובד', 
        required: false 
      },
      { 
        pattern: /^(שעות שבועיות|שעות|hours|weekly.?hours|work.?hours)$/i, 
        field: 'weekly_hours_required', 
        label: 'שעות שבועיות', 
        required: false 
      },
      { 
        pattern: /^(סניף|מחלקה|branch|department|dept|division|unit)$/i, 
        field: 'main_branch_id', 
        label: 'סניף ראשי', 
        required: false 
      },
      { 
        pattern: /^(הערות|הערה|notes|remarks|comment|comments|description)$/i, 
        field: 'notes', 
        label: 'הערות', 
        required: false 
      },
    ];

    // Track used fields to avoid duplicates
    const usedFields = new Set<string>();

    fileColumns.forEach((column, columnIndex) => {
      console.log(`🔍 Checking column "${column}" (index: ${columnIndex})`);
      
      // Clean the column name for better matching
      const cleanColumn = column.trim();
      
      const matchedRule = detectionRules.find(rule => {
        const isMatch = rule.pattern.test(cleanColumn);
        console.log(`  - Testing against ${rule.field}: ${isMatch ? '✅ MATCH' : '❌ no match'}`);
        return isMatch;
      });
      
      if (matchedRule && !usedFields.has(matchedRule.field)) {
        console.log(`✅ Auto-mapped: "${column}" → ${matchedRule.field}`);
        
        usedFields.add(matchedRule.field);
        
        mappings.push({
          id: `auto-${matchedRule.field}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          systemField: matchedRule.field,
          mappedColumns: [column], // Use original column name, not cleaned
          isRequired: matchedRule.required,
          label: matchedRule.label,
          isCustomField: false,
        });
      } else if (matchedRule) {
        console.log(`⚠️ Field ${matchedRule.field} already mapped, skipping "${column}"`);
      } else {
        console.log(`❌ No match found for column "${column}"`);
      }
    });

    console.log('🎯 Auto-detection results:', {
      totalColumns: fileColumns.length,
      mappedFields: mappings.length,
      mappings: mappings.map(m => `${m.systemField} ← ${m.mappedColumns[0]}`)
    });

    return mappings;
  }, []);

  return { autoDetectMappings };
};
