
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface ShiftSubmissionHeaderProps {
  submissionsCount: number;
}

export const ShiftSubmissionHeader: React.FC<ShiftSubmissionHeaderProps> = ({ submissionsCount }) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">היסטוריית הגשות משמרות</h3>
      <Badge variant="outline" className="ml-2">
        {submissionsCount} הגשות
      </Badge>
    </div>
  );
};
