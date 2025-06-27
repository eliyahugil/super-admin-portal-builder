
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm') return value.trim() !== '';
    if (key === 'sortBy' || key === 'sortOrder') return false; // לא נספור מיון כפילטר
    return value !== 'all';
  }).length;

  const handleTenureChange = (value: string) => {
    onFiltersChange({ tenure: value as EmployeeListFilters['tenure'] });
  };

  const handleSortChange = (field: string, value: string) => {
    if (field === 'sortBy') {
      onFiltersChange({ sortBy: value as EmployeeListFilters['sortBy'] });
    } else {
      onFiltersChange({ sortOrder: value as EmployeeListFilters['sortOrder'] });
    }
  };

  return (
    <Card className="mb-6" dir="rtl">
      <CardHeader className="pb-3">
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
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* חיפוש בסיסי */}
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            placeholder="חפש לפי שם, אימייל, טלפון או מספר עובד..."
            className="pr-10"
          />
        </div>

        {/* סינון מתקדם */}
        <Collapsible open={showAdvancedFilters} onOpenChange={onToggleAdvancedFilters}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* סוג עובד */}
              <div>
                <Label>סוג עובד</Label>
                <Select 
                  value={filters.employeeType} 
                  onValueChange={(value) => onFiltersChange({ employeeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסוגים</SelectItem>
                    <SelectItem value="permanent">קבוע</SelectItem>
                    <SelectItem value="temporary">זמני</SelectItem>
                    <SelectItem value="contractor">קבלן</SelectItem>
                    <SelectItem value="youth">נוער</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* סטטוס */}
              <div>
                <Label>סטטוס</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => onFiltersChange({ status: value as EmployeeListFilters['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="inactive">לא פעיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* וותק */}
              <div>
                <Label>וותק</Label>
                <Select value={filters.tenure} onValueChange={handleTenureChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הוותקים</SelectItem>
                    <SelectItem value="new">חדשים (עד 3 חודשים)</SelectItem>
                    <SelectItem value="experienced">מנוסים (3-12 חודשים)</SelectItem>
                    <SelectItem value="veteran">ותיקים (מעל שנה)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* סניף */}
              <div>
                <Label>סניף</Label>
                <Select 
                  value={filters.branch} 
                  onValueChange={(value) => onFiltersChange({ branch: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסניפים</SelectItem>
                    {/* TODO: צריך להוסיף רשימת סניפים דינמית */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* מיון */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>מיון לפי</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => handleSortChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">שם</SelectItem>
                    <SelectItem value="hire_date">תאריך קבלה לעבודה</SelectItem>
                    <SelectItem value="employee_type">סוג עובד</SelectItem>
                    <SelectItem value="created_at">תאריך הוספה למערכת</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>סדר</Label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value) => handleSortChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">עולה (א-ת, ישן-חדש)</SelectItem>
                    <SelectItem value="desc">יורד (ת-א, חדש-ישן)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={onResetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                אפס פילטרים
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* הגדרות תצוגה */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">עובדים בעמוד:</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(value === 'unlimited' ? 'unlimited' : Number(value) as PageSize)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="unlimited">הכל ({totalEmployees})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              מציג {filteredCount} מתוך {totalEmployees} עובדים
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
