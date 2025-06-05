
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { CustomField } from '@/utils/moduleTypes';

interface ModuleFieldsBuilderProps {
  fields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
}

export const ModuleFieldsBuilder: React.FC<ModuleFieldsBuilderProps> = ({
  fields,
  onFieldsChange
}) => {
  const fieldTypes = [
    { value: 'text', label: 'טקסט' },
    { value: 'number', label: 'מספר' },
    { value: 'email', label: 'אימייל' },
    { value: 'date', label: 'תאריך' },
    { value: 'boolean', label: 'כן/לא' },
    { value: 'select', label: 'רשימה נפתחת' },
    { value: 'textarea', label: 'טקסט ארוך' }
  ];

  const addField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false
    };
    onFieldsChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onFieldsChange(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          שדות המודל
          <Button onClick={addField} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            הוסף שדה
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            לא הוגדרו שדות עדיין. לחץ על "הוסף שדה" כדי להתחיל.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">שדה {index + 1}</span>
                  </div>
                  <Button
                    onClick={() => removeField(field.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם השדה</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      placeholder="לדוגמה: שם הפרויקט"
                    />
                  </div>

                  <div>
                    <Label>סוג השדה</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateField(field.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                  />
                  <Label>שדה חובה</Label>
                </div>

                {field.type === 'select' && (
                  <div>
                    <Label>אפשרויות (מופרדות בפסיקים)</Label>
                    <Input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateField(field.id, { 
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                      })}
                      placeholder="אפשרויות 1, אפשרות 2, אפשרות 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
