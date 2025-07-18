
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Filter, Calendar, Building, UserCheck, FileText, Clock } from 'lucide-react';

interface ShiftTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  timeSlotFilter?: string;
  onTimeSlotFilterChange?: (value: string) => void;
  showOnlyWithSubmissions?: boolean;
  onShowOnlyWithSubmissionsChange?: (checked: boolean) => void;
  showEmployeeApprovalFilter?: boolean;
  onEmployeeApprovalChange?: (checked: boolean) => void;
}

export const ShiftTableFilters: React.FC<ShiftTableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  branchFilter,
  onBranchFilterChange,
  timeSlotFilter = 'all',
  onTimeSlotFilterChange,
  showOnlyWithSubmissions = false,
  onShowOnlyWithSubmissionsChange,
  showEmployeeApprovalFilter = false,
  onEmployeeApprovalChange
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* שורה ראשונה - פילטרים בסיסיים */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="חיפוש עובדים או הערות..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="סטטוס" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="approved">מאושר</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="תקופה" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">כל התקופות</SelectItem>
              <SelectItem value="today">היום</SelectItem>
              <SelectItem value="this_week">השבוע</SelectItem>
              <SelectItem value="next_week">השבוע הבא</SelectItem>
              <SelectItem value="this_month">החודש</SelectItem>
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={onBranchFilterChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="סניף" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">כל הסניפים</SelectItem>
              <SelectItem value="main">מרכזי</SelectItem>
              <SelectItem value="branch1">סניף א'</SelectItem>
              <SelectItem value="branch2">סניף ב'</SelectItem>
            </SelectContent>
          </Select>
          </div>

          {/* שורה שנייה - פילטרים מתקדמים */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
            {/* פילטר שעות משמרת */}
            {onTimeSlotFilterChange && (
              <Select value={timeSlotFilter} onValueChange={onTimeSlotFilterChange}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="שעות משמרת" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="all">כל השעות</SelectItem>
                  <SelectItem value="morning">בוקר (06:00-14:00)</SelectItem>
                  <SelectItem value="evening">ערב (14:00-22:00)</SelectItem>
                  <SelectItem value="night">לילה (22:00-06:00)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* פילטר הגשות משמרות */}
            {onShowOnlyWithSubmissionsChange && (
              <div className="flex items-center space-x-2 p-2 border rounded-lg bg-green-50 border-green-200">
                <FileText className="h-4 w-4 text-green-600" />
                <Label htmlFor="submissions-filter" className="text-sm font-medium text-green-700">
                  רק משמרות עם הגשות
                </Label>
                <Switch
                  id="submissions-filter"
                  checked={showOnlyWithSubmissions}
                  onCheckedChange={onShowOnlyWithSubmissionsChange}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            )}

            {/* פילטר אישור עובדים */}
            {onEmployeeApprovalChange && (
              <div className="flex items-center space-x-2 p-2 border rounded-lg bg-blue-50 border-blue-200">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <Label htmlFor="approval-filter" className="text-sm font-medium text-blue-700">
                  אישור עובדים
                </Label>
                <Switch
                  id="approval-filter"
                  checked={showEmployeeApprovalFilter}
                  onCheckedChange={onEmployeeApprovalChange}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
