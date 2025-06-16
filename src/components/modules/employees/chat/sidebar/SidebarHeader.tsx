
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export const SidebarHeader: React.FC = () => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          צ'אט עובדים
        </CardTitle>
      </div>
    </CardHeader>
  );
};
