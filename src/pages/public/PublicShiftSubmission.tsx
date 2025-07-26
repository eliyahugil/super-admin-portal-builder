
import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicShifts } from '@/hooks/usePublicShifts';
import { PublicShiftSubmissionForm } from '@/components/modules/shifts/public/PublicShiftSubmissionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const PublicShiftSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { useToken } = usePublicShifts();
  
  const { data: tokenData, isLoading, error } = useToken(token || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">שגיאה</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {error?.message || 'טוקן לא נמצא או שפג תוקפו'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            הגשת משמרות
          </h1>
          <p className="text-gray-600">
            בחר את המשמרות שברצונך לעבוד השבוע
          </p>
        </div>

        <PublicShiftSubmissionForm token={token || ''} />
      </div>
    </div>
  );
};

export default PublicShiftSubmission;
