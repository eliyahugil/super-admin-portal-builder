
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Plus, Trash2, Eye, EyeOff, Edit2, Check, X } from 'lucide-react';
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
  const [isCreatingCustomField, setIsCreatingCustomField] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [newCustomFieldLabel, setNewCustomFieldLabel] = useState('');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldLabel, setEditFieldLabel] = useState('');
  
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
      setMappings(autoMappings);
    }
  }, [open, fileColumns, autoDetectMappings]);

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

  const handleCreateCustomField = () => {
    if (!newCustomFieldName.trim()) return;

    const customMapping: FieldMapping = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: `custom_${newCustomFieldName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
      mappedColumns: [],
      isRequired: false,
      label: newCustomFieldLabel.trim() || `שדה מותאם: ${newCustomFieldName}`,
      isCustomField: true,
      customFieldName: newCustomFieldName.trim(),
    };

    setMappings([...mappings, customMapping]);
    setNewCustomFieldName('');
    setNewCustomFieldLabel('');
    setIsCreatingCustomField(false);
  };

  const handleUpdateCustomField = (id: string) => {
    if (!editFieldName.trim()) return;
    
    updateMapping(id, {
      customFieldName: editFieldName.trim(),
      label: editFieldLabel.trim() || `שדה מותאם: ${editFieldName}`,
      systemField: `custom_${editFieldName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
    });
    
    setEditingFieldId(null);
    setEditFieldName('');
    setEditFieldLabel('');
  };

  const handleStartEdit = (mapping: FieldMapping) => {
    setEditingFieldId(mapping.id);
    setEditFieldName(mapping.customFieldName || mapping.systemField.replace('custom_', ''));
    setEditFieldLabel(mapping.label);
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
      const headerIndex = fileColumns.indexOf(columnName);
      return row[headerIndex] || '';
    }
    return row[columnName] || '';
  };

  const getAvailableColumns = (currentMappingId: string) => {
    // Get all columns that are already mapped by other mappings
    const mappedColumns = new Set<string>();
    mappings.forEach(mapping => {
      if (mapping.id !== currentMappingId) {
        mapping.mappedColumns.forEach(col => mappedColumns.add(col));
      }
    });
    
    // Return columns that are not mapped by other mappings
    return fileColumns.filter(col => !mappedColumns.has(col));
  };

  const handleColumnToggle = (mappingId: string, column: string, isSelected: boolean) => {
    const mapping = mappings.find(m => m.id === mappingId);
    if (!mapping) return;

    let newColumns;
    if (isSelected) {
      newColumns = [...mapping.mappedColumns, column];
    } else {
      newColumns = mapping.mappedColumns.filter(col => col !== column);
    }
    
    updateMapping(mappingId, { mappedColumns: newColumns });
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
          {/* Preview Toggle and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
            </Button>
            
            <div className="flex gap-2">
              <Button onClick={addMapping} variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                הוסף מיפוי
              </Button>
              <Button 
                onClick={() => setIsCreatingCustomField(true)} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-blue-300 text-blue-600"
              >
                <Plus className="h-4 w-4" />
                צור שדה חדש
              </Button>
            </div>
          </div>

          {/* Create Custom Field */}
          {isCreatingCustomField && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800">יצירת שדה מותאם חדש</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="newFieldName">שם השדה</Label>
                      <Input
                        id="newFieldName"
                        value={newCustomFieldName}
                        onChange={(e) => setNewCustomFieldName(e.target.value)}
                        placeholder="לדוגמה: מספר ביטוח לאומי"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newFieldLabel">תווית תצוגה</Label>
                      <Input
                        id="newFieldLabel"
                        value={newCustomFieldLabel}
                        onChange={(e) => setNewCustomFieldLabel(e.target.value)}
                        placeholder="כיצד השדה יוצג במערכת"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateCustomField}
                      disabled={!newCustomFieldName.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      צור שדה
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingCustomField(false);
                        setNewCustomFieldName('');
                        setNewCustomFieldLabel('');
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      ביטול
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              <Card key={mapping.id} className={mapping.isCustomField ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  {editingFieldId === mapping.id && mapping.isCustomField ? (
                    // Edit custom field form
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>שם השדה</Label>
                          <Input
                            value={editFieldName}
                            onChange={(e) => setEditFieldName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>תווית תצוגה</Label>
                          <Input
                            value={editFieldLabel}
                            onChange={(e) => setEditFieldLabel(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateCustomField(mapping.id)}
                          disabled={!editFieldName.trim()}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          שמור
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingFieldId(null);
                            setEditFieldName('');
                            setEditFieldLabel('');
                          }}
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          ביטול
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Regular mapping form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div>
                          <label className="block text-sm font-medium mb-2">שדה במערכת</label>
                          {mapping.isCustomField ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 p-2 bg-green-100 rounded border">
                                {mapping.label}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(mapping)}
                                className="text-green-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={mapping.systemField}
                              onValueChange={(value) => {
                                const field = allSystemFields.find(f => f.value === value);
                                updateMapping(mapping.id, {
                                  systemField: value,
                                  label: field?.label || value,
                                  isCustomField: false
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
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            עמודות בקובץ ({mapping.mappedColumns.length} נבחרו)
                          </label>
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                            {getAvailableColumns(mapping.id).concat(mapping.mappedColumns).map((column) => {
                              const isSelected = mapping.mappedColumns.includes(column);
                              return (
                                <label key={column} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleColumnToggle(mapping.id, column, e.target.checked)}
                                    className="rounded"
                                  />
                                  <span className={isSelected ? 'font-medium' : ''}>
                                    {column || `עמודה ${fileColumns.indexOf(column) + 1}`}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">דוגמה</label>
                          <div className="p-2 bg-gray-50 rounded text-sm min-h-[2.5rem]">
                            {mapping.mappedColumns.length > 0 ? (
                              mapping.mappedColumns.map(col => getSampleValue(col)).filter(val => val).join(' + ') || 'אין נתונים'
                            ) : (
                              'לא נבחרו עמודות'
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {mapping.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              חובה
                            </Badge>
                          )}
                          {mapping.isCustomField && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              שדה מותאם
                            </Badge>
                          )}
                          {mapping.mappedColumns.length > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {mapping.mappedColumns.length} עמודות
                            </Badge>
                          )}
                        </div>
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                חזור להעלאה
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button onClick={handleConfirm}>
                המשך לתצוגה מקדימה ({mappings.filter(m => m.mappedColumns.length > 0).length} מיפויים)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
