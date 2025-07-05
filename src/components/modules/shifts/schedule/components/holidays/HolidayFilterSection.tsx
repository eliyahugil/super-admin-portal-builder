
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface HolidayFilterSectionProps {
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  totalEvents: number;
  shabbatCount: number;
  availableTypes: string[];
  holidayTypeCounts: Record<string, number>;
  isMobile?: boolean;
}

export const HolidayFilterSection: React.FC<HolidayFilterSectionProps> = ({
  typeFilter,
  onTypeFilterChange,
  totalEvents,
  shabbatCount,
  availableTypes,
  holidayTypeCounts,
  isMobile = false
}) => {
  return (
    <Card className="shadow-sm">
      <CardContent className={isMobile ? 'p-3' : 'p-4'}>
        <div className={`flex items-center gap-${isMobile ? '2' : '4'}`}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">סינון לפי סוג:</span>
          </div>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className={isMobile ? 'w-full h-10' : 'w-64'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים ({totalEvents})</SelectItem>
              <SelectItem value="shabbat">שבת ({shabbatCount})</SelectItem>
              {availableTypes.filter(type => type !== 'שבת').map(type => (
                <SelectItem key={type} value={type}>
                  {type} ({holidayTypeCounts[type] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
