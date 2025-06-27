
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface FiltersHeaderProps {
  filters: EmployeeListFilters;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export const FiltersHeader: React.FC<FiltersHeaderProps> = ({
  filters,
  showAdvancedFilters,
  onToggleAdvancedFilters,
}) => {
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.trim() !== '';
    if (key === 'sortBy' || key === 'sortOrder') return false; // לא נספור מיון כפילטר
    return value !== 'all';
  }).length;

  return (
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Filter className="h-5 w-5" />
        סינון וחיפוש עובדים
      </CardTitle>
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {activeFiltersCount} פילטרים פעילים
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAdvancedFilters}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          סינון מתקדם
          {showAdvancedFilters ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
};
