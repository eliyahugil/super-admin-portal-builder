
import React from 'react';
import { Sidebar, SidebarHeader, SidebarContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export const SidebarLoading: React.FC = () => {
  return (
    <Sidebar side="right" className="border-r border-border hidden md:flex">
      <SidebarHeader className="p-4 text-right">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
