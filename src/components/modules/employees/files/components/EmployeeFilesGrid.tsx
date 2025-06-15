
import React from 'react';
import { EmployeeFilesCard } from './EmployeeFilesCard';
import type { EmployeeFile } from '../hooks/useEmployeeFilesManagement';

interface EmployeeFilesGridProps {
  files: EmployeeFile[] | undefined;
  onDownload: (file: EmployeeFile) => void;
  onDelete: (file: EmployeeFile) => void;
  isDeleting: boolean;
}

export const EmployeeFilesGrid: React.FC<EmployeeFilesGridProps> = ({
  files,
  onDownload,
  onDelete,
  isDeleting,
}) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבצים</h3>
        <p className="text-gray-600">לא נמצאו קבצים במערכת</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <EmployeeFilesCard
          key={file.id}
          file={file}
          onDownload={onDownload}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
