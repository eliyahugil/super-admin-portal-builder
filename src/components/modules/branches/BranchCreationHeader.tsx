
import React from 'react';

interface BranchCreationHeaderProps {
  businessId: string | null;
}

export const BranchCreationHeader: React.FC<BranchCreationHeaderProps> = ({ businessId }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">יצירת סניף חדש</h1>
      <p className="text-gray-600">הוסף סניף חדש לעסק</p>
      {businessId && (
        <p className="text-sm text-blue-600 mt-2">עסק נוכחי: {businessId}</p>
      )}
    </div>
  );
};
