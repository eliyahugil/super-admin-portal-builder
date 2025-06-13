
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmployeeListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  loading: boolean;
}

export const EmployeeListHeader: React.FC<EmployeeListHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  onBulkDelete,
  loading,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="חיפוש לפי שם, מספר עובד, טלפון או אימייל..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            נבחרו {selectedCount} עובדים
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={loading}
          >
            מחק נבחרים
          </Button>
        </div>
      )}
    </div>
  );
};
