
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface BranchCreationHeaderProps {
  businessId: string | null;
}

export const BranchCreationHeader: React.FC<BranchCreationHeaderProps> = ({ businessId }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          יצירת סניף חדש
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">הוסף סניף חדש למערכת</p>
        {businessId && (
          <p className="text-sm text-blue-600 mt-2">עסק: {businessId}</p>
        )}
      </CardContent>
    </Card>
  );
};
