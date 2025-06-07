
import React from 'react';
import { UserPlus } from 'lucide-react';

export const AccessRequestsHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <UserPlus className="h-8 w-8" />
        ניהול בקשות גישה
      </h1>
      <p className="text-gray-600 mt-2">סקור ואשר בקשות גישה למערכת</p>
    </div>
  );
};
