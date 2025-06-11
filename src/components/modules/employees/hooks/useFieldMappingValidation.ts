
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { FieldMapping } from '../types/FieldMappingTypes';

export const useFieldMappingValidation = () => {
  const { toast } = useToast();

  const validateMappings = useCallback((mappings: FieldMapping[]): boolean => {
    const validMappings = mappings.filter(m => 
      m.systemField && m.mappedColumns.length > 0
    );

    if (validMappings.length === 0) {
      toast({
        title: 'שגיאת מיפוי',
        description: 'יש לבחור לפחות שדה אחד לייבוא',
        variant: 'destructive'
      });
      return false;
    }

    // Check for required fields
    const requiredFields = ['first_name', 'last_name'];
    const mappedSystemFields = validMappings.map(m => m.systemField);
    const missingRequired = requiredFields.filter(field => !mappedSystemFields.includes(field));

    if (missingRequired.length > 0) {
      toast({
        title: 'שדות חובה חסרים',
        description: `יש למפות את השדות הבאים: ${missingRequired.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }

    return true;
  }, [toast]);

  return { validateMappings };
};
