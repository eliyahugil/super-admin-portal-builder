
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, User, Calendar } from 'lucide-react';
import { ShiftSubmission } from '../types';

interface ShiftStatsCardsProps {
  submissions: ShiftSubmission[] | undefined;
}

export const ShiftStatsCards: React.FC<ShiftStatsCardsProps> = ({ submissions }) => {
  // ספירת משמרות רגילות בלבד (לא מיוחדות)
  const regularSubmissions = submissions?.filter((s: ShiftSubmission) => 
    !s.submission_type || s.submission_type === 'regular'
  ) || [];
  
  // ספירת משמרות מיוחדות
  const specialSubmissions = submissions?.filter((s: ShiftSubmission) => 
    s.submission_type && s.submission_type !== 'regular'
  ) || [];

  // פונקציה לספירת משמרות ייחודיות בתוך הגשות
  const countUniqueShifts = (submissions: ShiftSubmission[]) => {
    const uniqueShifts = new Set<string>();
    
    submissions.forEach(submission => {
      if (submission.shifts) {
        try {
          const shiftsData = typeof submission.shifts === 'string' 
            ? JSON.parse(submission.shifts) 
            : submission.shifts;
          
          if (Array.isArray(shiftsData)) {
            shiftsData.forEach((shift: any) => {
              // יצירת מפתח ייחודי לכל משמרת: עובד + תאריך + שעות
              const shiftKey = `${submission.employee_id}-${shift.date}-${shift.start_time}-${shift.end_time}`;
              uniqueShifts.add(shiftKey);
            });
          }
        } catch (error) {
          console.error('Error parsing shifts data:', error);
        }
      }
    });
    
    return uniqueShifts.size;
  };

  const uniqueRegularShifts = countUniqueShifts(regularSubmissions);
  const uniqueSpecialShifts = countUniqueShifts(specialSubmissions);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">משמרות רגילות</p>
              <p className="text-2xl font-bold">{uniqueRegularShifts}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">משמרות מיוחדות</p>
              <p className="text-2xl font-bold">{uniqueSpecialShifts}</p>
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
                {regularSubmissions ? new Set(regularSubmissions.map((s: ShiftSubmission) => s.employee_id)).size : 0}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">השבוע (רגילות)</p>
              <p className="text-2xl font-bold">
                {regularSubmissions?.filter((s: ShiftSubmission) => {
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
