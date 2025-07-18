import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { User, Phone, Calendar, Clock } from 'lucide-react';

interface TokenSubmissionsListProps {
  tokenId: string;
}

export const TokenSubmissionsList: React.FC<TokenSubmissionsListProps> = ({ tokenId }) => {
  const { useTokenSubmissions } = usePublicShifts();
  const { data: submissions = [], isLoading } = useTokenSubmissions(tokenId);

  if (isLoading) {
    return <div className="text-center p-4">טוען הגשות...</div>;
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

  const getDayName = (day: number) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[day] || '';
  };

  const getShiftTypeName = (type: string) => {
    const types = {
      morning: 'בוקר',
      afternoon: 'צהריים', 
      evening: 'ערב',
      night: 'לילה'
    };
    return types[type as keyof typeof types] || type;
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
        {submissions.map((submission) => (
          <div key={submission.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{submission.employee_name}</span>
              </div>
              <Badge variant="secondary">
                {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
              </Badge>
            </div>
            
            {submission.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{submission.phone}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>העדפות משמרות:</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {submission.shift_preferences?.map((pref, index) => (
                  <div key={index} className={`text-xs p-2 rounded border ${
                    pref.available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {getDayName(pref.day_of_week)} - {getShiftTypeName(pref.shift_type)}
                      </span>
                      <Badge variant={pref.available ? 'default' : 'destructive'} className="text-xs">
                        {pref.available ? 'זמין' : 'לא זמין'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{pref.start_time} - {pref.end_time}</span>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>

            {submission.notes && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">הערות: </span>
                <span className="text-gray-600">{submission.notes}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};