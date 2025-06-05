
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useBusiness } from '@/hooks/useBusiness';

export const Header: React.FC = () => {
  const { business, isSuperAdmin } = useBusiness();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">
          {business?.name || 'מערכת ניהול'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
        </span>
      </div>
    </header>
  );
};
