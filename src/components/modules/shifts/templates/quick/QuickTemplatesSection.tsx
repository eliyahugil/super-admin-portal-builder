
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, Trash2 } from 'lucide-react';
import { QUICK_TEMPLATES } from './constants';
import { QuickTemplate } from './types';

interface QuickTemplatesSectionProps {
  onQuickCreate: (template: QuickTemplate) => void;
  submitting: boolean;
  branches: any[];
}

export const QuickTemplatesSection: React.FC<QuickTemplatesSectionProps> = ({
  onQuickCreate,
  submitting,
  branches
}) => {
  const [hiddenQuickTemplates, setHiddenQuickTemplates] = useState<number[]>([]);

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">תבניות מהירות</Label>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_TEMPLATES.map((template, index) => (
          hiddenQuickTemplates.includes(index) ? null : (
            <div className="relative" key={index}>
              <Button
                variant="outline"
                onClick={() => onQuickCreate(template)}
                disabled={submitting || !branches || branches.length === 0}
                className="h-auto p-3 flex flex-col items-start text-right w-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{template.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {template.start_time} - {template.end_time}
                </span>
              </Button>
              <button
                type="button"
                aria-label="הסתר תבנית"
                className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition"
                onClick={() => setHiddenQuickTemplates((prev) => [...prev, index])}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
