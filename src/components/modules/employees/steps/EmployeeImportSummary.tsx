
import React from 'react';
import { ImportStatusHeader } from './components/ImportStatusHeader';
import { ImportStatisticsGrid } from './components/ImportStatisticsGrid';
import { ImportSuccessAlert } from './components/ImportSuccessAlert';
import { ImportedEmployeesList } from './components/ImportedEmployeesList';
import { ImportErrorsList } from './components/ImportErrorsList';
import { ImportActionButtons } from './components/ImportActionButtons';
import { ImportInfoCard } from './components/ImportInfoCard';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  skippedCount?: number;
  duplicateCount?: number;
  message: string;
  errors?: Array<{
    row: number;
    employee: string;
    error: string;
  }>;
  importedEmployees?: Array<{
    name: string;
    email?: string;
    branch?: string;
  }>;
}

interface EmployeeImportSummaryProps {
  result: ImportResult;
  onStartOver: () => void;
  onClose: () => void;
}

export const EmployeeImportSummary: React.FC<EmployeeImportSummaryProps> = ({
  result,
  onStartOver,
  onClose,
}) => {
  const totalProcessed = result.importedCount + result.errorCount + (result.skippedCount || 0);
  
  return (
    <div className="space-y-6" dir="rtl">
      <ImportStatusHeader 
        success={result.success} 
        message={result.message} 
      />

      <ImportStatisticsGrid
        totalProcessed={totalProcessed}
        importedCount={result.importedCount}
        errorCount={result.errorCount}
        duplicateCount={result.duplicateCount || 0}
      />

      {result.success && result.importedCount > 0 && (
        <ImportSuccessAlert
          importedCount={result.importedCount}
          duplicateCount={result.duplicateCount}
        />
      )}

      <ImportedEmployeesList employees={result.importedEmployees || []} />

      <ImportErrorsList errors={result.errors || []} />

      <ImportActionButtons onStartOver={onStartOver} onClose={onClose} />

      <ImportInfoCard errorCount={result.errorCount} />
    </div>
  );
};
