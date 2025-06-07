
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';

interface EmptyValidationStateProps {
  onBackToMapping: () => void;
}

export const EmptyValidationState: React.FC<EmptyValidationStateProps> = ({
  onBackToMapping,
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">אין נתונים לבדיקה</h3>
        <p className="text-muted-foreground text-center mb-4">
          לא נמצאו נתונים תקינים לייבוא. אנא בדוק את הקובץ והמיפוי.
        </p>
        <Button variant="outline" onClick={onBackToMapping}>
          חזור למיפוי
        </Button>
      </CardContent>
    </Card>
  );
};
