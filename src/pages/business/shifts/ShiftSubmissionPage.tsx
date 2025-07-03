
import React from 'react';
import { ShiftSubmissionManager } from '@/components/modules/shifts/ShiftSubmissionManager';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const ShiftSubmissionPage: React.FC = () => {
  const { loading, error } = useCurrentBusiness();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <ShiftSubmissionManager />
    </div>
  );
};

export default ShiftSubmissionPage;
