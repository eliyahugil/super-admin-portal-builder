
import { useState, useEffect } from 'react';
import type { ShiftData } from '../types';

export const useShiftTablePagination = (sortedShifts: ShiftData[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Pagination
  const totalPages = Math.ceil(sortedShifts.length / pageSize);
  const paginatedShifts = sortedShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedShifts.length]);

  return {
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    paginatedShifts
  };
};
