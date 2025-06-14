
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  required_employees: number;
  is_active: boolean;
  branch_id: string;
  business_id: string;
  created_at: string;
}

interface ShiftTemplateCardProps {
  template: ShiftTemplate;
  branches: any[];
  onDeactivate: (templateId: string) => void;
}

export const ShiftTemplateCard: React.FC<ShiftTemplateCardProps> = ({
  template,
  branches,
  onDeactivate
}) => {
  const getShiftTypeLabel = (type: ShiftType) => {
    switch (type) {
      case 'morning': return 'בוקר';
      case 'afternoon': return 'צהריים';
      case 'evening': return 'ערב';
      case 'night': return 'לילה';
      default: return type;
    }
  };

  const getShiftTypeBadgeVariant = (type: ShiftType) => {
    switch (type) {
      case 'morning': return 'default';
      case 'afternoon': return 'secondary';
      case 'evening': return 'outline';
      case 'night': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant={getShiftTypeBadgeVariant(template.shift_type)}>
            {getShiftTypeLabel(template.shift_type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{template.start_time} - {template.end_time}</span>
          </div>
          <div className="text-gray-600">
            עובדים נדרשים: {template.required_employees}
          </div>
          <div className="text-gray-600">
            סניף: {branches?.find(b => b.id === template.branch_id)?.name || 'לא נמצא'}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeactivate(template.id)}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            הסר
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
