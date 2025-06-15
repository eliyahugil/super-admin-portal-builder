
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { FiltersState } from '../types';

interface EmployeeFilesFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  onClearFilters: () => void;
}

export const EmployeeFilesFilters: React.FC<EmployeeFilesFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const hasActiveFilters = filters.searchTerm || filters.dateFilter || filters.fileTypeFilter;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* חיפוש */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש עובדים, קבצים או מסמכים..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* פילטר תאריך */}
        <div className="w-full sm:w-auto">
          <Input
            type="date"
            value={filters.dateFilter}
            onChange={(e) => onFiltersChange({ ...filters, dateFilter: e.target.value })}
            placeholder="תאריך"
          />
        </div>

        {/* פילטר סוג קובץ */}
        <div className="w-full sm:w-auto">
          <select
            value={filters.fileTypeFilter}
            onChange={(e) => onFiltersChange({ ...filters, fileTypeFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
          >
            <option value="">כל הסוגים</option>
            <option value="pdf">PDF</option>
            <option value="image">תמונות</option>
            <option value="document">מסמכים</option>
            <option value="signed_document">מסמכים חתומים</option>
          </select>
        </div>

        {/* כפתור ניקוי פילטרים */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            נקה פילטרים
          </Button>
        )}
      </div>
    </div>
  );
};
