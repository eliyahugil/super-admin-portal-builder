
import React from 'react';

export const ChatPageLoading: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">טוען עובדים...</p>
      </div>
    </div>
  );
};
