
import React from 'react';

interface WeeklyToken {
  token: string;
  week_start_date: string;
  week_end_date: string;
  is_active: boolean;
}

interface EmployeeNote {
  content: string;
  note_type: string;
  created_at: string;
}

interface EmployeeQuickStatsProps {
  weeklyTokens?: WeeklyToken[];
  employeeNotes?: EmployeeNote[];
}

export const EmployeeQuickStats: React.FC<EmployeeQuickStatsProps> = ({
  weeklyTokens,
  employeeNotes
}) => {
  const activeTokensCount = weeklyTokens?.filter(t => t.is_active).length || 0;
  const recentNotesCount = employeeNotes?.slice(0, 2).length || 0;

  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500">
        {activeTokensCount} טוקנים פעילים
      </div>
      <div className="text-xs text-gray-500">
        {recentNotesCount} הערות
      </div>
    </div>
  );
};
