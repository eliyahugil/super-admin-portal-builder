
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, ArrowRight, Eye } from 'lucide-react';
import { FieldMappingRow } from './FieldMappingRow';
import { FieldMappingPreview } from './FieldMappingPreview';
import { useToast } from '@/hooks/use-toast';

export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isCustomField?: boolean;
  customFieldName?: string;
}

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: Record<string, any>[];
  onConfirm: (mappings: FieldMapping[]) => void;
  systemFields?: Array<{ value: string; label: string }>;
}

const defaultSystemFields = [
  { value: 'first_name', label: 'שם פרטי' },
  { value: 'last_name', label: 'שם משפחה' },
  { value: 'full_name', label: 'שם מלא' },
  { value: 'email', label: 'אימייל' },
  { value: 'phone', label: 'טלפון' },
  { value: 'id_number', label: 'מספר זהות' },
  { value: 'employee_id', label: 'מספר עובד' },
  { value: 'address', label: 'כתובת' },
  { value: 'hire_date', label: 'תאריך תחילת עבודה' },
  { value: 'employee_type', label: 'סוג עובד' },
  { value: 'weekly_hours_required', label: 'שעות שבועיות נדרשות' },
  { value: 'notes', label: 'הערות' },
  { value: 'branch_name', label: 'סניף' },
  { value: 'role', label: 'תפקיד' }
];

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  systemFields = defaultSystemFields,
}) => {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState('');

  // Auto-detect initial mappings when dialog opens
  useEffect(() => {
    if (open && fileColumns.length > 0) {
      const autoMappings = autoDetectMappings(fileColumns);
      setMappings(autoMappings);
    }
  }, [open, fileColumns]);

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

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      systemField: '',
      mappedColumns: [],
      isCustomField: false,
    };
    setMappings([...mappings, newMapping]);
  };

  const addCustomField = () => {
    if (!newCustomFieldName.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם שדה',
        variant: 'destructive',
      });
      return;
    }

    const newMapping: FieldMapping = {
      id: `custom-${Date.now()}`,
      systemField: `custom:${newCustomFieldName}`,
      mappedColumns: [],
      isCustomField: true,
      customFieldName: newCustomFieldName,
    };

    setMappings([...mappings, newMapping]);
    setNewCustomFieldName('');

    toast({
      title: 'הצלחה',
      description: `שדה מותאם "${newCustomFieldName}" נוצר`,
    });
  };

  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(mapping => 
      mapping.id === id ? { ...mapping, ...updates } : mapping
    ));
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(mapping => mapping.id !== id));
  };

  const validateMappings = (): boolean => {
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

  const handleConfirm = () => {
    if (!validateMappings()) return;

    const validMappings = mappings.filter(m => 
      m.systemField && m.mappedColumns.length > 0
    );

    onConfirm(validMappings);
    onOpenChange(false);
  };

  const getUnmappedColumns = () => {
    const mappedColumns = mappings.flatMap(m => m.mappedColumns);
    return fileColumns.filter(col => !mappedColumns.includes(col));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            מיפוי שדות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">שיוך שדות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappings.map((mapping) => (
                <FieldMappingRow
                  key={mapping.id}
                  mapping={mapping}
                  fileColumns={fileColumns}
                  systemFields={systemFields}
                  onUpdate={(updates) => updateMapping(mapping.id, updates)}
                  onRemove={() => removeMapping(mapping.id)}
                />
              ))}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMapping}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף שיוך
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Field Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">יצירת שדה מותאם אישית</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="customFieldName">שם השדה החדש</Label>
                  <Input
                    id="customFieldName"
                    value={newCustomFieldName}
                    onChange={(e) => setNewCustomFieldName(e.target.value)}
                    placeholder="למשל: סוג חוזה"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addCustomField}
                  disabled={!newCustomFieldName.trim()}
                  className="mt-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף שדה
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unmapped Columns Warning */}
          {getUnmappedColumns().length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">עמודות לא ממופות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-2">
                  העמודות הבאות לא ממופות לשדה במערכת ולא יובאו:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getUnmappedColumns().map((column) => (
                    <Badge key={column} variant="outline" className="text-orange-700">
                      {column}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && (
            <FieldMappingPreview
              mappings={mappings.filter(m => m.systemField && m.mappedColumns.length > 0)}
              sampleData={sampleData}
              systemFields={systemFields}
            />
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ביטול
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={mappings.filter(m => m.systemField && m.mappedColumns.length > 0).length === 0}
              >
                אשר מיפוי
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
