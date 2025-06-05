
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface IntegrationControlsProps {
  integrationId: string;
  isActive: boolean;
  notes: string;
  onActiveChange: (checked: boolean) => void;
  onNotesChange: (notes: string) => void;
}

export const IntegrationControls: React.FC<IntegrationControlsProps> = ({
  integrationId,
  isActive,
  notes,
  onActiveChange,
  onNotesChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 space-x-reverse">
        <Switch 
          checked={isActive} 
          onCheckedChange={onActiveChange}
          id={`active-${integrationId}`}
        />
        <Label htmlFor={`active-${integrationId}`}>
          הפעל אינטגרציה זו
        </Label>
      </div>

      <div>
        <Label htmlFor={`notes-${integrationId}`}>
          הערות (אופציונלי)
        </Label>
        <Textarea
          id={`notes-${integrationId}`}
          placeholder="הערות נוספות על האינטגרציה..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  );
};
