
import React from 'react';
import { useShiftSubmissions } from './hooks/useShiftSubmissions';
import { ShiftStatsCards } from './dashboard/ShiftStatsCards';
import { ShiftSearch } from './dashboard/ShiftSearch';
import { SendReminderButton } from './dashboard/SendReminderButton';
import { ShiftSubmissionList } from './dashboard/ShiftSubmissionList';

export const ShiftSubmissionsDashboard: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    submissions,
    filteredSubmissions, 
    isLoading,
    parseShifts,
    sendWhatsApp
  } = useShiftSubmissions();

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דשבורד הגשות משמרות</h1>
        <p className="text-gray-600">מעקב אחר הגשות משמרות שבועיות מעובדים</p>
      </div>

      {/* Action Buttons */}
      <SendReminderButton submissions={submissions} />

      {/* Search */}
      <ShiftSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Stats Cards */}
      <ShiftStatsCards submissions={submissions} />

      {/* Submissions List */}
      <ShiftSubmissionList 
        filteredSubmissions={filteredSubmissions}
        parseShifts={parseShifts}
        sendWhatsApp={sendWhatsApp}
      />
    </div>
  );
};
