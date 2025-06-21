
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { ImportManager } from '../ImportManager';

export const ImportToolsCard: React.FC = () => {
  console.log('🔧 ImportToolsCard rendering');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">כלי ייבוא</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" dir="rtl">
          <p className="text-sm text-gray-600">
            ייבא עובדים מקובץ Excel או CSV
          </p>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">מנהל הייבוא:</p>
            <ImportManager />
          </div>
          
          <div className="text-xs text-gray-500">
            תומך בפורמטים: .xlsx, .xls, .csv
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
