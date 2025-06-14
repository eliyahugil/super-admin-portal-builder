
import React from "react";

export const UserStatusBadge: React.FC<{ isActive?: boolean }> = ({ isActive }) => (
  <span
    className={
      "inline-block rounded-full px-3 py-1 text-xs font-bold shadow-sm " +
      (isActive ? "bg-green-200 text-green-700" : "bg-gray-300 text-gray-600")
    }
  >
    {isActive ? "פעיל" : "כבוי"}
  </span>
);
