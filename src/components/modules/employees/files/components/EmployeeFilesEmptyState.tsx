
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { FiltersState } from '../types';

interface EmployeeFilesEmptyStateProps {
  filters: FiltersState;
}

export const EmployeeFilesEmptyState: React.FC<EmployeeFilesEmptyStateProps> = ({ filters }) => {
  const hasActiveFilters = filters.searchTerm || filters.dateFilter || filters.fileTypeFilter;

  return (
    <Card>
      <CardContent className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">אין קבצים</h3>
        <p className="text-gray-600">
          {hasActiveFilters 
            ? 'לא נמצאו קבצים התואמים לסינון'
            : 'לא הועלו עדיין קבצים במערכת'
          }
        </p>
      </CardContent>
    </Card>
  );
};
