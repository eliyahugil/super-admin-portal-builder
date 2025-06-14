
import React from 'react';
import { GroupedFiles } from '../types';

interface EmployeeFilesStatsProps {
  groupedFiles: GroupedFiles[];
}

export const EmployeeFilesStats: React.FC<EmployeeFilesStatsProps> = ({ groupedFiles }) => {
  const totalFiles = groupedFiles.reduce((sum, group) => sum + group.files.length, 0);

  return (
    <div className="mb-6 text-right">
      <div className="text-sm text-gray-600">
        נמצאו {groupedFiles.length} עובדים עם {totalFiles} קבצים
      </div>
    </div>
  );
};
