
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PageSize } from './useEmployeeListPagination';

interface EmployeeListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalEmployees: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export const EmployeeListPagination: React.FC<EmployeeListPaginationProps> = ({
  currentPage,
  totalPages,
  totalEmployees,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const pageSizeOptions: { value: PageSize; label: string }[] = [
    { value: 10, label: '10 עובדים' },
    { value: 25, label: '25 עובדים' },
    { value: 50, label: '50 עובדים' },
    { value: 100, label: '100 עובדים' },
    { value: 'unlimited', label: 'ללא הגבלה' },
  ];

  const getPageSizeLabel = (size: PageSize) => {
    const option = pageSizeOptions.find(opt => opt.value === size);
    return option?.label || '25 עובדים';
  };

  const startIndex = pageSize === 'unlimited' ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = pageSize === 'unlimited' ? totalEmployees : Math.min(currentPage * pageSize, totalEmployees);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border rounded-lg" dir="rtl">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">הצג:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            const newPageSize = value === 'unlimited' ? 'unlimited' : parseInt(value) as PageSize;
            onPageSizeChange(newPageSize);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>{getPageSizeLabel(pageSize)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600">
        {totalEmployees > 0 ? (
          pageSize === 'unlimited' ? (
            `מציג את כל ${totalEmployees} העובדים`
          ) : (
            `מציג ${startIndex}-${endIndex} מתוך ${totalEmployees} עובדים`
          )
        ) : (
          'אין עובדים להצגה'
        )}
      </div>

      {/* Pagination Controls */}
      {pageSize !== 'unlimited' && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 mx-2">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
