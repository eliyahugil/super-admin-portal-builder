
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getStatusColor, getStatusIcon, getStatusLabel } from './utils/shiftSubmissionUtils';

interface ShiftSubmissionCardProps {
  submission: any;
}

export const ShiftSubmissionCard: React.FC<ShiftSubmissionCardProps> = ({ submission }) => {
  const parseShifts = (shifts: any) => {
    if (typeof shifts === 'string') {
      try {
        return JSON.parse(shifts);
      } catch {
        return [];
      }
    }
    return Array.isArray(shifts) ? shifts : [];
  };

  const shiftsData = parseShifts(submission.shifts);

  console.log('📝 ShiftSubmissionCard - Processing submission:', {
    id: submission.id,
    weekStart: submission.week_start_date,
    weekEnd: submission.week_end_date,
    shiftsCount: shiftsData.length,
    status: submission.status
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            שבוע {format(new Date(submission.week_start_date), 'dd/MM', { locale: he })} - 
            {format(new Date(submission.week_end_date), 'dd/MM/yyyy', { locale: he })}
          </CardTitle>
          <Badge className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}>
            {getStatusIcon(submission.status)}
            {getStatusLabel(submission.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">תאריך הגשה:</span>
            <div className="font-medium">
              {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
            </div>
          </div>
          <div>
            <span className="text-gray-500">מספר משמרות:</span>
            <div className="font-medium">
              {shiftsData.length}
            </div>
          </div>
        </div>
        
        {submission.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <span className="text-gray-500 text-sm">הערות:</span>
            <p className="text-sm mt-1">{submission.notes}</p>
          </div>
        )}

        {shiftsData.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-500 text-sm">משמרות:</span>
            <div className="mt-2 space-y-2">
              {shiftsData.map((shift: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                  <span>{shift.date || 'תאריך לא זמין'}</span>
                  <span>{shift.start_time || shift.startTime} - {shift.end_time || shift.endTime}</span>
                  {(shift.branch_preference || shift.branch) && (
                    <span className="text-blue-600">{shift.branch_preference || shift.branch}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
