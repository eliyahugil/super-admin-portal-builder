
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, CheckCircle } from 'lucide-react';

interface FloatingAutoMappingMenuProps {
  onApplyAutoMapping: () => void;
  onClearMappings: () => void;
  onRemoveUnmapped: () => void;
  hasAutoDetections: boolean;
  mappedCount: number;
  totalColumns: number;
}

export const FloatingAutoMappingMenu: React.FC<FloatingAutoMappingMenuProps> = ({
  onApplyAutoMapping,
  onClearMappings,
  onRemoveUnmapped,
  hasAutoDetections,
  mappedCount,
  totalColumns,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          כלי מיפוי אוטומטי
          {hasAutoDetections && (
            <Badge variant="secondary" className="text-xs">
              {mappedCount}/{totalColumns}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="text-sm font-medium">כלי מיפוי מהיר</div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onApplyAutoMapping}
              className="w-full justify-start"
              disabled={!hasAutoDetections}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              יישם מיפוי אוטומטי
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearMappings}
              className="w-full justify-start"
            >
              נקה את כל המיפויים
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveUnmapped}
              className="w-full justify-start"
            >
              הסר שדות לא ממופים
            </Button>
          </div>
          
          {hasAutoDetections && (
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              זוהו {mappedCount} שדות אוטומטית מתוך {totalColumns} עמודות
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
