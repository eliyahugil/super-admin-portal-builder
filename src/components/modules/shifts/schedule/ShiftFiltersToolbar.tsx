import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Users, Building2, Sun, Moon, Clock } from 'lucide-react';
import type { Employee, Branch } from './types';

export type FilterType = 'all' | 'branch' | 'time' | 'employee' | 'role';
export type TimeFilter = 'all' | 'morning' | 'evening' | 'night';

export interface ShiftFilters {
  type: FilterType;
  branchId?: string;
  timeFilter: TimeFilter;
  employeeId?: string;
  roleFilter?: string;
}

interface ShiftFiltersToolbarProps {
  filters: ShiftFilters;
  onFiltersChange: (filters: ShiftFilters) => void;
  employees: Employee[];
  branches: Branch[];
  className?: string;
  onSavePreferences?: () => void;
}

export const ShiftFiltersToolbar: React.FC<ShiftFiltersToolbarProps> = ({
  filters,
  onFiltersChange,
  employees,
  branches,
  className = '',
  onSavePreferences
}) => {
  const handleFilterTypeChange = (type: FilterType) => {
    onFiltersChange({
      ...filters,
      type,
      // Reset specific filters when changing type
      branchId: type === 'branch' ? filters.branchId : undefined,
      employeeId: type === 'employee' ? filters.employeeId : undefined,
      roleFilter: type === 'role' ? filters.roleFilter : undefined,
    });
  };

  const handleTimeFilterChange = (timeFilter: TimeFilter) => {
    onFiltersChange({ ...filters, timeFilter });
  };

  const handleBranchChange = (branchId: string) => {
    onFiltersChange({ ...filters, branchId: branchId === 'all' ? undefined : branchId });
  };

  const handleEmployeeChange = (employeeId: string) => {
    onFiltersChange({ ...filters, employeeId: employeeId === 'all' ? undefined : employeeId });
  };

  const handleRoleChange = (roleFilter: string) => {
    onFiltersChange({ ...filters, roleFilter: roleFilter === 'all' ? undefined : roleFilter });
  };

  const getTimeFilterIcon = (filter: TimeFilter) => {
    switch (filter) {
      case 'morning': return <Sun className="h-4 w-4" />;
      case 'evening': return <Moon className="h-4 w-4" />;
      case 'night': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.timeFilter !== 'all') count++;
    if (filters.branchId) count++;
    if (filters.employeeId) count++;
    if (filters.roleFilter) count++;
    return count;
  };

  // Get unique roles from shifts  
  const getUniqueRoles = () => {
    const roles = new Set<string>();
    employees.forEach(employee => {
      // You might need to get this from shifts data or employee assignments
      // For now, let's use common roles
    });
    return ['קופאי', 'מכירות', 'מנהל', 'אבטחה', 'ניקיון', 'מחסן', 'שירות לקוחות'];
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: 'all',
      timeFilter: 'all',
      branchId: undefined,
      employeeId: undefined,
      roleFilter: undefined,
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 space-y-4 ${className}`} dir="rtl">
      {/* Main Filter Type Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">תצוגה:</span>
        </div>
        
        <Tabs value={filters.type} onValueChange={(value) => handleFilterTypeChange(value as FilterType)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              הכל
            </TabsTrigger>
            <TabsTrigger value="branch" className="text-xs">
              <Building2 className="h-3 w-3 ml-1" />
              לפי סניף
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs">
              <Clock className="h-3 w-3 ml-1" />
              לפי זמן
            </TabsTrigger>
            <TabsTrigger value="employee" className="text-xs">
              <Users className="h-3 w-3 ml-1" />
              לפי עובד
            </TabsTrigger>
            <TabsTrigger value="role" className="text-xs">
              <Users className="h-3 w-3 ml-1" />
              לפי תפקיד
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Quick Time Filters */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">זמן:</span>
        <div className="flex gap-2">
          {(['all', 'morning', 'evening', 'night'] as TimeFilter[]).map((timeFilter) => (
            <Button
              key={timeFilter}
              variant={filters.timeFilter === timeFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeFilterChange(timeFilter)}
              className="text-xs"
            >
              {getTimeFilterIcon(timeFilter)}
              <span className="mr-1">
                {timeFilter === 'all' && 'הכל'}
                {timeFilter === 'morning' && 'בוקר'}
                {timeFilter === 'evening' && 'ערב'}
                {timeFilter === 'night' && 'לילה'}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Specific Filters based on type */}
      {filters.type === 'branch' && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">סניף:</span>
          <Select value={filters.branchId || 'all'} onValueChange={handleBranchChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="בחר סניף..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסניפים</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filters.type === 'employee' && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">עובד:</span>
          <Select value={filters.employeeId || 'all'} onValueChange={handleEmployeeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="בחר עובד..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העובדים</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filters.type === 'role' && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">תפקיד:</span>
          <Select value={filters.roleFilter || 'all'} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="בחר תפקיד..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל התפקידים</SelectItem>
              {getUniqueRoles().map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">פילטרים פעילים:</span>
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              נקה הכל
            </Button>
            {onSavePreferences && (
              <Button variant="outline" size="sm" onClick={onSavePreferences} className="text-xs">
                שמור העדפות
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};