
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AccessRequestsDebugCardProps {
  totalRequests: number;
  pendingCount: number;
  processedCount: number;
}

export const AccessRequestsDebugCard: React.FC<AccessRequestsDebugCardProps> = ({
  totalRequests,
  pendingCount,
  processedCount
}) => {
  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <h3 className="font-medium mb-2 text-yellow-800">מידע דיבוג למפתח:</h3>
        <div className="text-sm space-y-1">
          <p>סה"כ בקשות: {totalRequests}</p>
          <p>בקשות ממתינות: {pendingCount}</p>
          <p>בקשות מעובדות: {processedCount}</p>
          <p className="text-xs text-yellow-700 mt-2">
            אם אינך רואה פרטי משתמש, בדוק את הקונסול לפרטים נוספים
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
