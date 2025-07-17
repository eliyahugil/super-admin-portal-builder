
import React from 'react';
import { SidebarFooter as BaseSidebarFooter } from '@/components/ui/sidebar';

export const SidebarFooterContent: React.FC = () => {
  return (
    <BaseSidebarFooter className="p-4 text-right border-t">
      <div className="text-xs text-muted-foreground">
        גרסה 1.0.0
      </div>
    </BaseSidebarFooter>
  );
};
