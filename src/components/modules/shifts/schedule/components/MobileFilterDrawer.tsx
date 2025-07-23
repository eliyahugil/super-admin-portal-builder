
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';
import type { Employee, Branch } from '../types';

interface MobileFilterDrawerProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  employees: Employee[];
  branches: Branch[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  searchTerm,
  onSearchChange,
  selectedEmployee,
  onEmployeeChange,
  selectedBranch,
  onBranchChange,
  selectedStatus,
  onStatusChange,
  employees,
  branches,
  filteredCount,
  totalCount,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || selectedEmployee !== 'all' || selectedBranch !== 'all' || selectedStatus !== 'all';
  const activeFiltersCount = [searchTerm, selectedEmployee !== 'all', selectedBranch !== 'all', selectedStatus !== 'all'].filter(Boolean).length;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 ml-2" />
          סינון
          {hasActiveFilters && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]" dir="rtl">
        <DrawerHeader className="text-right">
          <DrawerTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              סינון משמרות
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 ml-1" />
                נקה הכל
              </Button>
            )}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="mobile-search">חיפוש</Label>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="mobile-search"
                placeholder="חיפוש משמרות..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Employee Filter */}
          <div className="space-y-2">
            <Label>עובד</Label>
            <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder="כל העובדים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העובדים</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Filter */}
          <div className="space-y-2">
            <Label>סניף</Label>
            <Select value={selectedBranch} onValueChange={onBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="כל הסניפים" />
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

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>סטטוס</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="rejected">נדחה</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                מציג {filteredCount} מתוך {totalCount} משמרות
              </span>
              {hasActiveFilters && (
                <Badge variant="secondary">
                  {activeFiltersCount} מסננים פעילים
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
