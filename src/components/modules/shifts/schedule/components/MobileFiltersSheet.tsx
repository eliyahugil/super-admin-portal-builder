import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, RotateCcw, Search } from 'lucide-react';
import type { Employee, Branch } from '../types';

interface MobileFiltersSheetProps {
  filters: {
    status: string;
    employee: string;
    branch: string;
    role: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  employees: Employee[];
  branches: Branch[];
  onResetFilters: () => void;
}

export const MobileFiltersSheet: React.FC<MobileFiltersSheetProps> = ({
  filters,
  onFiltersChange,
  employees,
  branches,
  onResetFilters
}) => {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.employee !== 'all') count++;
    if (filters.branch !== 'all') count++;
    if (filters.role !== 'all') count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 ml-1" />
          סינון
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -left-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[80vh]" dir="rtl">
        <SheetHeader className="text-right mb-6">
          <SheetTitle className="text-xl font-bold">סינון משמרות</SheetTitle>
          <SheetDescription className="text-base">
            סנן את המשמרות לפי הקריטריונים הרצויים
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-base font-semibold">חיפוש חופשי</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="חפש לפי שם עובד, סניף, הערות..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10 text-base"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">סטטוס משמרת</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין לאישור</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="assigned">משויך</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee Filter */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">עובד</Label>
            <Select
              value={filters.employee}
              onValueChange={(value) => onFiltersChange({ ...filters, employee: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="בחר עובד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העובדים</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Filter */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">סניף</Label>
            <Select
              value={filters.branch}
              onValueChange={(value) => onFiltersChange({ ...filters, branch: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="בחר סניף" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסניפים</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">מסננים פעילים ({activeFiltersCount})</h4>
              <div className="space-y-1 text-sm">
                {filters.status !== 'all' && (
                  <div className="flex items-center justify-between">
                    <span>סטטוס: <strong>{filters.status}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {filters.employee !== 'all' && (
                  <div className="flex items-center justify-between">
                    <span>עובד: <strong>{employees.find(e => e.id === filters.employee)?.first_name}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, employee: 'all' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {filters.branch !== 'all' && (
                  <div className="flex items-center justify-between">
                    <span>סניף: <strong>{branches.find(b => b.id === filters.branch)?.name}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, branch: 'all' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {searchTerm && (
                  <div className="flex items-center justify-between">
                    <span>חיפוש: <strong>{searchTerm}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchChange('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={onResetFilters}
            disabled={activeFiltersCount === 0}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 ml-1" />
            נקה הכל
          </Button>
          <SheetClose asChild>
            <Button className="flex-1">
              החל מסננים
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};