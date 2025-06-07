
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ImportInfoCardProps {
  errorCount: number;
}

export const ImportInfoCard: React.FC<ImportInfoCardProps> = ({
  errorCount,
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">מידע חשוב:</p>
            <ul className="space-y-1 text-xs">
              <li>• עובדים שיובאו בהצלחה זמינים כעת במערכת ניהול העובדים</li>
              <li>• ניתן לערוך פרטי עובדים בכל עת דרך מסך ניהול העובדים</li>
              <li>• עובדים כפולים (לפי אימייל/טלפון/ת.ז) דולגו אוטומטית</li>
              {errorCount > 0 && (
                <li>• מומלץ לתקן שגיאות בקובץ המקורי ולייבא שוב</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
