
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, List } from 'lucide-react';

interface IntegrationViewModeToggleProps {
  viewMode: 'merged' | 'tabs';
  onViewModeChange: (mode: 'merged' | 'tabs') => void;
  integrationCount: number;
}

export const IntegrationViewModeToggle: React.FC<IntegrationViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  integrationCount,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span>מצב תצוגה:</span>
        <Badge variant="outline" className="text-xs">
          {integrationCount} אינטגרציות
        </Badge>
      </div>
      
      <div className="flex border rounded-lg p-1">
        <Button
          variant={viewMode === 'merged' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('merged')}
          className="flex items-center gap-2 text-xs"
        >
          <List className="h-3 w-3" />
          תצוגה מוזגת
        </Button>
        
        <Button
          variant={viewMode === 'tabs' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('tabs')}
          className="flex items-center gap-2 text-xs"
        >
          <LayoutGrid className="h-3 w-3" />
          לשוניות
        </Button>
      </div>
    </div>
  );
};
