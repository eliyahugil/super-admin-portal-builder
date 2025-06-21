
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';

interface CustomFieldCreationSectionProps {
  onAddCustomField: (mapping: FieldMapping) => void;
}

export const CustomFieldCreationSection: React.FC<CustomFieldCreationSectionProps> = ({
  onAddCustomField,
}) => {
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldType, setCustomFieldType] = useState('text');

  const handleAddCustomField = () => {
    if (!customFieldName.trim()) return;

    const customMapping: FieldMapping = {
      id: `custom-${Date.now()}`,
      systemField: `custom:${customFieldName}`,
      mappedColumns: [],
      isCustomField: true,
      customFieldName: customFieldName.trim(),
    };

    onAddCustomField(customMapping);
    setCustomFieldName('');
    setCustomFieldType('text');
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">יצירת שדה מותאם אישית</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="custom-field-name">שם השדה</Label>
            <Input
              id="custom-field-name"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="לדוגמה: מחלקה"
            />
          </div>
          <div>
            <Label htmlFor="custom-field-type">סוג השדה</Label>
            <Select value={customFieldType} onValueChange={setCustomFieldType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">טקסט</SelectItem>
                <SelectItem value="number">מספר</SelectItem>
                <SelectItem value="date">תאריך</SelectItem>
                <SelectItem value="email">אימייל</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddCustomField}
              disabled={!customFieldName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              הוסף שדה
            </Button>
          </div>
        </div>
        <p className="text-sm text-blue-700">
          שדות מותאמים אישית יישמרו במסד הנתונים ויהיו זמינים לעריכה בפרופיל העובד
        </p>
      </CardContent>
    </Card>
  );
};
