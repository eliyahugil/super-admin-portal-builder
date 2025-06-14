
import React from "react";

export const UsernameField: React.FC<{ username?: string | null }> = ({ username }) => (
  <span className="truncate text-gray-900">
    {username || <span className="text-gray-400">אין</span>}
  </span>
);
