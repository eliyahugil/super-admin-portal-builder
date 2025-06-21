
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useFieldMappingAutoDetection } from './hooks/useFieldMappingAutoDetection';
import { useFieldMappingValidation } from './hooks/useFieldMappingValidation';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: any[];
  onConfirm: (mappings: FieldMapping[]) => void;
  onBack?: () => void;
  systemFields?: Array<{ value: string; label: string }>;
}

export const FieldMappingDialog: React.FC<FieldMappingDialogProps> = ({
  open,
  onOpenChange,
  fileColumns,
  sampleData,
  onConfirm,
  onBack,
  systemFields = []
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { autoDetectMappings } = useFieldMappingAutoDetection();
  const { validateMappings } = useFieldMappingValidation();

  // Default system fields
  const defaultSystemFields = [
    { value: 'first_name', label: 'שם פרטי' },
    { value: 'last_name', label: 'שם משפחה' },
    { value: 'email', label: 'אימייל' },
    { value: 'phone', label: 'טלפון' },
    { value: 'id_number', label: 'תעודת זהות' },
    { value: 'employee_id', label: 'מספר עובד' },
    { value: 'address', label: 'כתובת' },
    { value: 'hire_date', label: 'תאריך התחלה' },
    { value: 'employee_type', label: 'סוג עובד' },
    { value: 'weekly_hours_required', label: 'שעות שבועיות' },
    { value: 'main_branch_id', label: 'סניף ראשי' },
    { value: 'notes', label: 'הערות' },
  ];

  const allSystemFields = systemFields.length > 0 ? systemFields : defaultSystemFields;

  // Auto-detect mappings when dialog opens
  useEffect(() => {
    if (open && fileColumns.length > 0) {
      console.log('🔍 Auto-detecting mappings for columns:', fileColumns);
      const autoMappings = autoDetectMappings(fileColumns);
      
      // Add some manual mappings for generic column names
      const manualMappings: FieldMapping[] = [];
      
      // If we have array data, try to map by position
      if (sampleData.length > 0 && Array.isArray(sampleData[0])) {
        // Create generic column mappings for the first few columns
        for (let i = 0; i < Math.min(fileColumns.length, 12); i++) {
          const columnName = fileColumns[i] || `Column ${i + 1}`;
          let systemField = '';
          let label = '';
          
          switch (i) {
            case 0:
              systemField = 'first_name';
              label = 'שם פרטי';
              break;
            case 1:
              systemField = 'last_name';
              label = 'שם משפחה';
              break;
            case 2:
              systemField = 'email';
              label = 'אימייל';
              break;
            case 3:
              systemField = 'phone';
              label = 'טלפון';
              break;
            case 4:
              systemField = 'id_number';
              label = 'תעודת זהות';
              break;
            case 5:
              systemField = 'employee_id';
              label = 'מספר עובד';
              break;
            default:
              systemField = `custom_column_${i + 1}`;
              label = `עמודה ${i + 1}`;
              break;
          }
          
          // Only add if not already mapped by auto-detection
          if (!autoMappings.some(m => m.systemField === systemField)) {
            manualMappings.push({
              id: `manual-${systemField}-${Date.now()}-${i}`,
              systemField,
              mappedColumns: [columnName],
              isRequired: i < 2, // First two columns are required
              label,
              isCustomField: systemField.startsWith('custom_'),
            });
          }
        }
      }
      
      const combinedMappings = [...autoMappings, ...manualMappings];
      console.log('🎯 Combined mappings:', combinedMappings);
      setMappings(combinedMappings);
    }
  }, [open, fileColumns, autoDetectMappings, sampleData]);

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: '',
      mappedColumns: [],
      isRequired: false,
      label: '',
      isCustomField: false,
    };
    setMappings([...mappings, newMapping]);
  };

  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(mapping => 
      mapping.id === id ? { ...mapping, ...updates } : mapping
    ));
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(mapping => mapping.id !== id));
  };

  const handleConfirm = () => {
    const validMappings = mappings.filter(m => m.systemField && m.mappedColumns.length > 0);
    
    if (!validateMappings(validMappings)) {
      return;
    }
    
    console.log('✅ Confirming mappings:', validMappings);
    onConfirm(validMappings);
  };

  const getSampleValue = (columnName: string, sampleIndex: number = 0) => {
    if (!sampleData[sampleIndex]) return '';
    
    const row = sampleData[sampleIndex];
    if (Array.isArray(row)) {
      // Try to find by column index
      const columnMatch = columnName.match(/^(?:Column\s*|Col\s*|C)?(\d+)$/i);
      if (columnMatch) {
        const columnIndex = parseInt(columnMatch[1]) - 1;
        return row[columnIndex] || '';
      }
      // Try to find by column name in first row
      const headerIndex = fileColumns.indexOf(columnName);
      return row[headerIndex] || '';
    }
    return row[columnName] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-right">מיפוי שדות</DialogTitle>
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                חזור להעלאה
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6" dir="rtl">
          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'הסתר תצוגה מקדימה' :  'הצג תצוגה מקדימה'}
            </Button>
            
            <Button onClick={addMapping} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף מיפוי
            </Button>
          </div>

          {/* Sample Data Preview */}
          {showPreview && sampleData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>תצוגה מקדימה של הנתונים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {fileColumns.map((column, index) => (
                          <th key={index} className="text-right p-2 font-medium">
                            {column || `עמודה ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {fileColumns.map((column, colIndex) => (
                            <td key={colIndex} className="p-2 text-right">
                              {getSampleValue(column, rowIndex)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mappings List */}
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <Card key={mapping.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-2">שדה במערכת</label>
                      <Select
                        value={mapping.systemField}
                        onValueChange={(value) => {
                          const field = allSystemFields.find(f => f.value === value);
                          updateMapping(mapping.id, {
                            systemField: value,
                            label: field?.label || value,
                            isCustomField: value.startsWith('custom_')
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר שדה" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSystemFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">עמודה בקובץ</label>
                      <Select
                        value={mapping.mappedColumns[0] || ''}
                        onValueChange={(value) => updateMapping(mapping.id, {
                          mappedColumns: value ? [value] : []
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר עמודה" />
                        </SelectTrigger>
                        <SelectContent>
                          {fileColumns.map((column, index) => (
                            <SelectItem key={index} value={column}>
                              {column || `עמודה ${index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">דוגמה</label>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {mapping.mappedColumns[0] ? getSampleValue(mapping.mappedColumns[0]) : 'אין נתונים'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {mapping.isRequired && (
                        <Badge variant="destructive" className="text-xs">
                          חובה
                        </Badge>
                      )}
                      {mapping.isCustomField && (
                        <Badge variant="secondary" className="text-xs">
                          מותאם
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMapping(mapping.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                חזור להעלאה
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button onClick={handleConfirm}>
                המשך לתצוגה מקדימה
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
