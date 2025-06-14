
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface BusinessFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const BusinessFilters: React.FC<BusinessFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש עסק או בעל עסק..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>
          <Tabs value={selectedStatus} onValueChange={onStatusChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="active">פעילים</TabsTrigger>
              <TabsTrigger value="inactive">לא פעילים</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
