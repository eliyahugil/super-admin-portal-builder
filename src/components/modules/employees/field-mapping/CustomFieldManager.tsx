import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface CustomFieldManagerProps {
  mappings: FieldMapping[];
  fileColumns: string[];
  onAddCustomField: (customMapping: FieldMapping) => void;
  onUpdateCustomField: (mappingId: string, newName: string, newLabel: string) => void;
  onRemoveCustomField: (mappingId: string) => void;
}

export const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({
  mappings,
  fileColumns,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldLabel, setEditFieldLabel] = useState('');

  const customFields = mappings.filter(m => m.isCustomField);
  
  // Get all mapped columns from all mappings
  const allMappedColumns = new Set<string>();
  mappings.forEach(mapping => {
    mapping.mappedColumns.forEach(column => {
      allMappedColumns.add(column);
    });
  });

  // Filter out columns that are already mapped to any field
  const unmappedColumns = fileColumns.filter(column => 
    !allMappedColumns.has(column)
  );

  console.log('🔍 CustomFieldManager - Column mapping status:', {
    totalColumns: fileColumns.length,
    mappedColumns: Array.from(allMappedColumns),
    unmappedColumns,
    mappingsWithColumns: mappings.map(m => ({ 
      field: m.systemField, 
      columns: m.mappedColumns 
    }))
  });

  const handleCreateField = () => {
    if (!newFieldName.trim()) return;

    const customMapping: FieldMapping = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: `custom_${newFieldName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
      mappedColumns: [],
      isRequired: false,
      label: newFieldLabel.trim() || `שדה מותאם: ${newFieldName}`,
      isCustomField: true,
      customFieldName: newFieldName.trim(),
    };

    onAddCustomField(customMapping);
    setNewFieldName('');
    setNewFieldLabel('');
    setIsCreating(false);
  };

  const handleQuickAddFromColumn = (column: string) => {
    const customMapping: FieldMapping = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemField: `custom_${column.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`,
      mappedColumns: [column],
      isRequired: false,
      label: `שדה מותאם: ${column}`,
      isCustomField: true,
      customFieldName: column,
    };

    onAddCustomField(customMapping);
  };

  const handleStartEdit = (field: FieldMapping) => {
    setEditingFieldId(field.id);
    setEditFieldName(field.customFieldName || field.systemField.replace('custom_', ''));
    setEditFieldLabel(field.label);
  };

  const handleSaveEdit = () => {
    if (!editingFieldId || !editFieldName.trim()) return;
    
    onUpdateCustomField(editingFieldId, editFieldName.trim(), editFieldLabel.trim());
    setEditingFieldId(null);
    setEditFieldName('');
    setEditFieldLabel('');
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditFieldName('');
    setEditFieldLabel('');
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          ניהול שדות מותאמים
        </CardTitle>
        <p className="text-sm text-gray-600">
          הוסף, ערוך ומחק שדות מותאמים לפי הצורך
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Add from Unmapped Columns */}
        {unmappedColumns.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-600">
              הוסף שדות מהעמודות הלא ממופות ({unmappedColumns.length}):
            </Label>
            <div className="flex flex-wrap gap-2">
              {unmappedColumns.map((column) => (
                <Button
                  key={column}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAddFromColumn(column)}
                  className="text-xs border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {column}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Show message when all columns are mapped */}
        {unmappedColumns.length === 0 && fileColumns.length > 0 && (
          <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600 font-medium">✅ כל העמודות ממופות</div>
            <div className="text-sm text-green-500 mt-1">
              כל {fileColumns.length} העמודות מהקובץ כבר ממופות לשדות במערכת
            </div>
          </div>
        )}

        {/* Create New Field */}
        {isCreating ? (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="space-y-3">
              <div>
                <Label htmlFor="newFieldName">שם השדה</Label>
                <Input
                  id="newFieldName"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="לדוגמה: מספר ביטוח לאומי"
                />
              </div>
              <div>
                <Label htmlFor="newFieldLabel">תווית תצוגה</Label>
                <Input
                  id="newFieldLabel"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="כיצד השדה יוצג במערכת"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateField}
                  disabled={!newFieldName.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  צור שדה
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewFieldName('');
                    setNewFieldLabel('');
                  }}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            צור שדה מותאם חדש
          </Button>
        )}

        {/* Existing Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-green-600">
              שדות מותאמים קיימים ({customFields.length}):
            </Label>
            <div className="space-y-2">
              {customFields.map((field) => (
                <div key={field.id} className="border rounded-lg p-3 bg-green-50">
                  {editingFieldId === field.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`edit-name-${field.id}`}>שם השדה</Label>
                        <Input
                          id={`edit-name-${field.id}`}
                          value={editFieldName}
                          onChange={(e) => setEditFieldName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-label-${field.id}`}>תווית תצוגה</Label>
                        <Input
                          id={`edit-label-${field.id}`}
                          value={editFieldLabel}
                          onChange={(e) => setEditFieldLabel(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={!editFieldName.trim()}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          שמור
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          size="sm"
                        >
                          <X className="h-3 w-3 mr-1" />
                          ביטול
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-green-800">
                          {field.label}
                        </div>
                        <div className="text-sm text-green-600">
                          שדה מערכת: {field.systemField}
                        </div>
                        {field.mappedColumns.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {field.mappedColumns.map((col) => (
                              <Badge key={col} variant="secondary" className="text-xs">
                                {col}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(field)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCustomField(field.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 טיפ: כאשר עמודה ממופה לשדה כלשהו, היא תעלם מרשימת העמודות הזמינות.
          השדות המותאמים יישמרו כמטאדאטה נוספת לכל עובד.
        </div>
      </CardContent>
    </Card>
  );
};
