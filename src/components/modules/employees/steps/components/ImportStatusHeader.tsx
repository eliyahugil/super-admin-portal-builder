
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface ImportStatusHeaderProps {
  success: boolean;
  message: string;
}

export const ImportStatusHeader: React.FC<ImportStatusHeaderProps> = ({
  success,
  message,
}) => {
  return (
    <Card>
      <CardHeader className="text-center">
        {success ? (
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        ) : (
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        )}
        <CardTitle className={success ? "text-green-700" : "text-red-700"}>
          {success ? 'ייבוא הושלם בהצלחה!' : 'ייבוא הושלם עם שגיאות'}
        </CardTitle>
        <CardDescription className="text-lg">
          {message}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
