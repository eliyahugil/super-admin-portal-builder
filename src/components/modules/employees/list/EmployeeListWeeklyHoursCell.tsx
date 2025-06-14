
import React from "react";
import { Employee } from "@/types/employee";

interface WeeklyHoursCellProps {
  weeklyHoursRequired?: number | null;
}

export const EmployeeListWeeklyHoursCell: React.FC<WeeklyHoursCellProps> = ({ weeklyHoursRequired }) => (
  weeklyHoursRequired ? (
    <span>{weeklyHoursRequired}</span>
  ) : (
    <span className="text-gray-400 text-sm">לא הוגדר</span>
  )
);
