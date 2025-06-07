
import { useToast } from '@/hooks/use-toast';
import { FieldMapping } from '../types/FieldMappingTypes';

export const useFieldMappingValidation = () => {
  const { toast } = useToast();

  const validateMappings = (mappings: FieldMapping[]): boolean => {
    // Check for duplicate system fields
    const usedFields = mappings
      .filter(m => m.systemField)
      .map(m => m.systemField);
    
    const duplicates = usedFields.filter((field, index) => 
      usedFields.indexOf(field) !== index
    );

    if (duplicates.length > 0) {
      toast({
        title: 'שגיאה במיפוי',
        description: 'אותו שדה מערכת לא יכול להיות ממופה פעמיים',
        variant: 'destructive',
      });
      return false;
    }

    // Check that all mappings have at least one column
    const emptyMappings = mappings.filter(m => 
      m.systemField && m.mappedColumns.length === 0
    );

    if (emptyMappings.length > 0) {
      toast({
        title: 'שגיאה במיפוי',
        description: 'כל שדה מערכת חייב להיות ממופה לעמודה אחת לפחות',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  return { validateMappings };
};
