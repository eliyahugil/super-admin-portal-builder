
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTokenSubmissions } from '@/hooks/useTokenSubmissions';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { User, Phone, Calendar, Clock } from 'lucide-react';

interface TokenSubmissionsListProps {
  tokenId: string;
}

export const TokenSubmissionsList: React.FC<TokenSubmissionsListProps> = ({ tokenId }) => {
  const { data: submissions = [], isLoading, error } = useTokenSubmissions(tokenId);

  if (isLoading) {
    return <div className="text-center p-4">טוען הגשות...</div>;
  }

  if (error) {
    console.error('Error loading submissions:', error);
    return <div className="text-center p-4 text-red-500">שגיאה בטעינת הגשות</div>;
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>הגשות עובדים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">עדיין לא התקבלו הגשות עבור טוקן זה</p>
        </CardContent>
      </Card>
    );
  }

  const parseShiftsData = (shifts: any) => {
    try {
      if (typeof shifts === 'string') {
        return JSON.parse(shifts);
      }
      return shifts || [];
    } catch (error) {
      console.error('Error parsing shifts data:', error);
      return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          הגשות עובדים ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions.map((submission) => {
          const shiftsData = parseShiftsData(submission.shifts);
          
          return (
            <div key={submission.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">עובד #{submission.employee_id.slice(-8)}</span>
                </div>
                <Badge variant="secondary">
                  {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>משמרות:</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(shiftsData) && shiftsData.map((shift: any, index: number) => (
                    <div key={index} className="text-xs p-2 rounded border bg-green-50 border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {shift.date} - {shift.start_time} - {shift.end_time}
                        </span>
                        <Badge variant="default" className="text-xs">
                          זמין
                        </Badge>
                      </div>
                      {shift.branch_preference && (
                        <div className="text-gray-600 mt-1">
                          סניף: {shift.branch_preference}
                        </div>
                      )}
                      {shift.role_preference && (
                        <div className="text-gray-600">
                          תפקיד: {shift.role_preference}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {submission.notes && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">הערות: </span>
                  <span className="text-gray-600">{submission.notes}</span>
                </div>
              )}

              <div className="text-xs text-gray-500">
                סטטוס: {submission.status} | סוג: {submission.submission_type}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
