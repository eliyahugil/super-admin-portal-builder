
import React from 'react';
import { SidebarHeader as BaseSidebarHeader } from '@/components/ui/sidebar';
import { useBusiness } from '@/hooks/useBusiness';

export const SidebarHeader: React.FC = () => {
  const { business, isSuperAdmin } = useBusiness();

  return (
    <BaseSidebarHeader className="p-4 text-right border-b">
      <h2 className="text-lg font-bold text-foreground text-right">
        {business?.name || 'ניהול מערכת'}
      </h2>
      {business && (
        <p className="text-sm text-muted-foreground text-right">
          {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
        </p>
      )}
    </BaseSidebarHeader>
  );
};
