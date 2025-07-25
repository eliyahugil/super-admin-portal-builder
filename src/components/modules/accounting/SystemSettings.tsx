import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface SystemSettingsProps {
  businessId: string;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ businessId }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">הגדרות מערכת</h2>
        <p className="text-gray-600">הגדרות מערכת החשבונות הממוחשבת</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            הגדרות כלליות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">בקרוב</h3>
            <p className="text-gray-600">מודול ההגדרות יהיה זמין בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};