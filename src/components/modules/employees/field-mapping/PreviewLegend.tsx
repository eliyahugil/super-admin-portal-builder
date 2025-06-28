
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info, Layers, User, Plus } from 'lucide-react';

export const PreviewLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <Info className="h-4 w-4" />
        <span className="font-medium">מקרא:</span>
      </div>
      
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        <User className="h-3 w-3" />
        שדה רגיל
      </Badge>
      
      <Badge variant="secondary" className="text-xs flex items-center gap-1">
        <Layers className="h-3 w-3" />
        מיפוי מרובה
      </Badge>
      
      <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-600">
        <Plus className="h-3 w-3" />
        שדה מותאם
      </Badge>
      
      <div className="text-xs text-blue-600 mr-auto">
        ניתן לערוך ערכים ישירות בטבלה לפני הייבוא
      </div>
    </div>
  );
};
