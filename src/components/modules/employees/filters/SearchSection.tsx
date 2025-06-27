
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="חפש לפי שם, אימייל, טלפון או מספר עובד..."
        className="pr-10"
      />
    </div>
  );
};
