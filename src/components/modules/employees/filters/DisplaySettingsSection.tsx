
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PageSize } from '@/hooks/useEmployeeListPreferences';

interface DisplaySettingsSectionProps {
  pageSize: PageSize;
  onPageSizeChange: (pageSize: PageSize) => void;
  totalEmployees: number;
  filteredCount: number;
}

export const DisplaySettingsSection: React.FC<DisplaySettingsSectionProps> = ({
  pageSize,
  onPageSizeChange,
  totalEmployees,
  filteredCount,
}) => {
  const handlePageSizeChange = (value: string) => {
    const newPageSize = value === 'unlimited' ? 'unlimited' : Number(value) as PageSize;
    onPageSizeChange(newPageSize);
  };

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">עובדים בעמוד:</Label>
          <Select 
            value={pageSize.toString()} 
            onValueChange={handlePageSizeChange}
          >
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
  );
};
