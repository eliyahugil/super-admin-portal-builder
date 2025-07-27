
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X, Search, Building, Users, Calendar, Clock } from 'lucide-react';
import type { ScheduleFiltersType, Employee, Branch } from '../types';

interface AdvancedScheduleFiltersProps {
  filters: ScheduleFiltersType;
  onFiltersChange: (filters: Partial<ScheduleFiltersType>) => void;
  employees: Employee[];
  branches: Branch[];
  onQuickFilter: (type: 'today' | 'tomorrow' | 'this_week' | 'next_week') => void;
  onResetFilters: () => void;
}

export const AdvancedScheduleFilters: React.FC<AdvancedScheduleFiltersProps> = ({
  filters,
  onFiltersChange,
  employees,
  branches,
  onQuickFilter,
  onResetFilters
}) => {
  const hasActiveFilters = filters.status !== 'all' || filters.employee !== 'all' || filters.branch !== 'all' || filters.role !== 'all';

  const quickFilters = [
    { key: 'today', label: 'היום', icon: Calendar },
    { key: 'tomorrow', label: 'מחר', icon: Calendar },
    { key: 'this_week', label: 'השבוע', icon: Calendar },
    { key: 'next_week', label: 'השבוע הבא', icon: Calendar }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            סינון וחיפוש מתקדם
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              נקה סינון
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick date filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">סינון מהיר לפי תאריכים</Label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => onQuickFilter(key as any)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Branch filter - עדיפות גבוהה */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Building className="h-3 w-3" />
              סניף
            </Label>
            <Select
              value={filters.branch}
              onValueChange={(value) => onFiltersChange({ branch: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר סניף" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסניפים</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {branch.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              סטטוס
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין לאישור</SelectItem>
                <SelectItem value="assigned">משובץ</SelectItem>
                <SelectItem value="approved">מאושר</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              עובד
            </Label>
            <Select
              value={filters.employee}
              onValueChange={(value) => onFiltersChange({ employee: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-auto">
                <SelectItem value="all">כל העובדים</SelectItem>
                <SelectItem value="unassigned">לא משובץ</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">תפקיד</Label>
            <Select
              value={filters.role}
              onValueChange={(value) => onFiltersChange({ role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                <SelectItem value="manager">מנהל</SelectItem>
                <SelectItem value="cashier">קופאי</SelectItem>
                <SelectItem value="sales">מכירות</SelectItem>
                <SelectItem value="security">אבטחה</SelectItem>
                <SelectItem value="cleaner">ניקיון</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">סינון פעיל:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  סטטוס: {filters.status === 'pending' ? 'ממתין' : 
                           filters.status === 'assigned' ? 'משובץ' :
                           filters.status === 'approved' ? 'מאושר' :
                           filters.status === 'completed' ? 'הושלם' : filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ status: 'all' })}
                  />
                </Badge>
              )}
              {filters.branch !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  סניף: {branches.find(b => b.id === filters.branch)?.name || 'לא ידוע'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ branch: 'all' })}
                  />
                </Badge>
              )}
              {filters.employee !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  עובד: {filters.employee === 'unassigned' ? 'לא משובץ' :
                         employees.find(e => e.id === filters.employee)?.first_name + ' ' + 
                         employees.find(e => e.id === filters.employee)?.last_name || 'לא ידוע'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ employee: 'all' })}
                  />
                </Badge>
              )}
              {filters.role !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  תפקיד: {filters.role}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ role: 'all' })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
