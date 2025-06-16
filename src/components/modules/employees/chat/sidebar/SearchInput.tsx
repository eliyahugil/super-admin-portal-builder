
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "חפש..."
}) => {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 pl-10"
        dir="rtl"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => onChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
