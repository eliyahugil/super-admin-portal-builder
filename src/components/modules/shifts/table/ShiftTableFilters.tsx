
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
import { Search, Filter, Calendar, Building } from 'lucide-react';

interface ShiftTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
}

export const ShiftTableFilters: React.FC<ShiftTableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  branchFilter,
  onBranchFilterChange
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
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
      </CardContent>
    </Card>
  );
};
