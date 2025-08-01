import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface JournalEntriesProps {
  businessId: string;
}

export const JournalEntries: React.FC<JournalEntriesProps> = ({ businessId }) => {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">רישומי יומן</h2>
          <p className="text-gray-600">ניהול ספר היומן הכללי</p>
        </div>
        <Button className="flex items-center gap-2 flex-row-reverse">
          <Plus className="h-4 w-4" />
          רישום חדש
        </Button>
      </div>

      <Card>
        <CardHeader dir="rtl">
          <CardTitle className="flex items-center gap-2 flex-row-reverse">
            <FileText className="h-5 w-5" />
            רישומי יומן
          </CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">בקרוב</h3>
            <p className="text-gray-600">מודול רישומי היומן יהיה זמין בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};