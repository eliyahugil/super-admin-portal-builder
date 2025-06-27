
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Archive } from 'lucide-react';

interface EmployeeListHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  loading: boolean;
}

export const EmployeeListHeader: React.FC<EmployeeListHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  onBulkDelete,
  loading
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="חיפוש עובדים..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
          dir="rtl"
        />
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            נבחרו {selectedCount} עובדים
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            disabled={loading}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
          >
            <Archive className="h-4 w-4" />
            העבר לארכיון
          </Button>
        </div>
      )}
    </div>
  );
};
