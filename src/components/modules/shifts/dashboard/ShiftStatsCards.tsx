
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, User, Calendar } from 'lucide-react';
import { ShiftSubmission } from '../types';

interface ShiftStatsCardsProps {
  submissions: ShiftSubmission[] | undefined;
}

export const ShiftStatsCards: React.FC<ShiftStatsCardsProps> = ({ submissions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">סה"כ הגשות</p>
              <p className="text-2xl font-bold">{submissions?.length || 0}</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">עובדים פעילים</p>
              <p className="text-2xl font-bold">
                {submissions ? new Set(submissions.map((s: ShiftSubmission) => s.employee_id)).size : 0}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">השבוע</p>
              <p className="text-2xl font-bold">
                {submissions?.filter((s: ShiftSubmission) => {
                  const weekStart = new Date(s.week_start_date);
                  const now = new Date();
                  const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                  return weekStart >= thisWeekStart;
                }).length || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
