
import React from 'react';
import { Users } from 'lucide-react';

export const EmployeeManagementHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8" />
          ניהול עובדים
        </h1>
        <p className="text-gray-600 mt-2">נהל עובדים, סניפים ומשמרות</p>
      </div>
    </div>
  );
};
