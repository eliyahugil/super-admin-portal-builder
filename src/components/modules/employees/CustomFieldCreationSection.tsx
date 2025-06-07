
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FieldMapping } from './types/FieldMappingTypes';

interface CustomFieldCreationSectionProps {
  onAddCustomField: (mapping: FieldMapping) => void;
}

export const CustomFieldCreationSection: React.FC<CustomFieldCreationSectionProps> = ({
  onAddCustomField,
}) => {
  const { toast } = useToast();
  const [newCustomFieldName, setNewCustomFieldName] = useState('');

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

    onAddCustomField(newMapping);
    setNewCustomFieldName('');

    toast({
      title: 'הצלחה',
      description: `שדה מותאם "${newCustomFieldName}" נוצר`,
    });
  };

  return (
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
  );
};
