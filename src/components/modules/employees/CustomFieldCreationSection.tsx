
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
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomFieldCreationSectionProps {
  onAddCustomField: (mapping: FieldMapping) => void;
}

export const CustomFieldCreationSection: React.FC<CustomFieldCreationSectionProps> = ({
  onAddCustomField,
}) => {
  const isMobile = useIsMobile();
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldType, setCustomFieldType] = useState('text');

  const handleAddCustomField = () => {
    if (!customFieldName.trim()) return;

    const customMapping: FieldMapping = {
      id: `custom-${Date.now()}`,
      systemField: `custom:${customFieldName}`,
      mappedColumns: [],
      isRequired: false,
      label: customFieldName.trim(),
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
        <CardTitle className={`text-blue-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
          יצירת שדה מותאם אישית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
          <div className={`${isMobile ? 'col-span-1' : 'col-span-1'}`}>
            <Label htmlFor="custom-field-name" className={`${isMobile ? 'text-sm' : ''}`}>
              שם השדה
            </Label>
            <Input
              id="custom-field-name"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="לדוגמה: מחלקה"
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>
          <div className={`${isMobile ? 'col-span-1' : 'col-span-1'}`}>
            <Label htmlFor="custom-field-type" className={`${isMobile ? 'text-sm' : ''}`}>
              סוג השדה
            </Label>
            <Select value={customFieldType} onValueChange={setCustomFieldType}>
              <SelectTrigger className={`${isMobile ? 'text-sm' : ''}`}>
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
          <div className={`${isMobile ? 'col-span-1 mt-2' : 'flex items-end'}`}>
            <Button
              type="button"
              onClick={handleAddCustomField}
              disabled={!customFieldName.trim()}
              className={`w-full ${isMobile ? 'text-sm' : ''}`}
            >
              <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
              הוסף שדה
            </Button>
          </div>
        </div>
        <p className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          שדות מותאמים אישית יישמרו במסד הנתונים ויהיו זמינים לעריכה בפרופיל העובד
        </p>
      </CardContent>
    </Card>
  );
};
