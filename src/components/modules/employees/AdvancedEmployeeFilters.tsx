
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { SearchSection } from './filters/SearchSection';
import { FilterSection } from './filters/FilterSection';
import { SortSection } from './filters/SortSection';
import { DisplaySettingsSection } from './filters/DisplaySettingsSection';
import { FiltersHeader } from './filters/FiltersHeader';
import type { EmployeeListFilters, PageSize } from '@/hooks/useEmployeeListPreferences';

interface AdvancedEmployeeFiltersProps {
  filters: EmployeeListFilters;
  onFiltersChange: (updates: Partial<EmployeeListFilters>) => void;
  onResetFilters: () => void;
  pageSize: PageSize;
  onPageSizeChange: (pageSize: PageSize) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  totalEmployees: number;
  filteredCount: number;
}

export const AdvancedEmployeeFilters: React.FC<AdvancedEmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  pageSize,
  onPageSizeChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  totalEmployees,
  filteredCount,
}) => {
  return (
    <Card className="mb-6" dir="rtl">
      <CardHeader className="pb-3">
        <FiltersHeader
          filters={filters}
          showAdvancedFilters={showAdvancedFilters}
          onToggleAdvancedFilters={onToggleAdvancedFilters}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* חיפוש בסיסי */}
        <SearchSection
          searchTerm={filters.searchTerm}
          onSearchChange={(searchTerm) => onFiltersChange({ searchTerm })}
        />

        {/* סינון מתקדם */}
        <Collapsible open={showAdvancedFilters} onOpenChange={onToggleAdvancedFilters}>
          <CollapsibleContent className="space-y-4">
            <FilterSection
              filters={filters}
              onFiltersChange={onFiltersChange}
            />

            <SortSection
              filters={filters}
              onFiltersChange={onFiltersChange}
              onResetFilters={onResetFilters}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* הגדרות תצוגה */}
        <DisplaySettingsSection
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          totalEmployees={totalEmployees}
          filteredCount={filteredCount}
        />
      </CardContent>
    </Card>
  );
};
