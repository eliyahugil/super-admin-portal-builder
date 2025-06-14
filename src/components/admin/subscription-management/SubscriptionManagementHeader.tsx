
import React from 'react';
import { Crown } from 'lucide-react';

export const SubscriptionManagementHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Crown className="h-8 w-8" />
        ניהול מנויים ותוכניות
      </h1>
      <p className="text-gray-600 mt-2">נהל תוכניות מנוי ומנויי עסקים</p>
    </div>
  );
};
