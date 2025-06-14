
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface ShiftTemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateChange: (value: string) => void;
  templates: ShiftTemplate[] | undefined;
}

export const ShiftTemplateSelector: React.FC<ShiftTemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateChange,
  templates
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="template" className="text-sm text-gray-600">תבנית משמרת *</Label>
      <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
        <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <SelectValue placeholder="בחר תבנית משמרת" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl shadow-lg border z-50">
          {templates?.map((template) => (
            <SelectItem key={template.id} value={template.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {template.name} ({template.start_time} - {template.end_time})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {(!templates || templates.length === 0) && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          לא נמצאו תבניות משמרות. יש ליצור תבנית משמרת תחילה.
        </div>
      )}
    </div>
  );
};
