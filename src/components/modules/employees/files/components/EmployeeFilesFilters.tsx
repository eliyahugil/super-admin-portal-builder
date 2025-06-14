
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar } from 'lucide-react';
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-end">
          <span>סינון וחיפוש</span>
          <Filter className="h-5 w-5" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">חיפוש לפי שם עובד או קובץ</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש עובד או קובץ..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">סינון לפי תאריך העלאה</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={filters.dateFilter}
                onChange={(e) => onFiltersChange({ ...filters, dateFilter: e.target.value })}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">סוג קובץ</label>
            <select
              value={filters.fileTypeFilter}
              onChange={(e) => onFiltersChange({ ...filters, fileTypeFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              dir="rtl"
            >
              <option value="">כל הסוגים</option>
              <option value="pdf">PDF</option>
              <option value="image">תמונות</option>
              <option value="document">מסמכים</option>
              <option value="excel">גיליונות</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
            >
              נקה סינונים
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
