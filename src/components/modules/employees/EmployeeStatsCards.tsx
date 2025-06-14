
import React from 'react';

interface EmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  archivedEmployees: number;
  branches: number;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  totalEmployees,
  activeEmployees,
  inactiveEmployees,
  archivedEmployees,
  branches,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
    <StatCard label="עובדים סה״כ" value={totalEmployees} />
    <StatCard label="עובדים פעילים" value={activeEmployees} />
    <StatCard label="לא פעילים" value={inactiveEmployees} />
    <StatCard label="ארכיון" value={archivedEmployees} />
    <StatCard label="סניפים" value={branches} />
  </div>
);

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-white flex flex-col items-center justify-center rounded-xl shadow p-2 sm:p-4 min-w-0">
    <span className="text-lg sm:text-2xl font-bold">{value}</span>
    <span className="text-[11px] sm:text-xs text-gray-600 text-center">{label}</span>
  </div>
);

