
import React from 'react';

export const LoadingDisplay: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
