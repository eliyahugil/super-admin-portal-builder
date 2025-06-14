
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Upload, Settings } from 'lucide-react';

interface ManagementToolsSectionProps {
  onRefetch: () => void;
}

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({ onRefetch }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">כלי ניהול</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          ייצא לאקסל
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Download className="h-4 w-4 mr-2" />
          הורד דוח עובדים
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          ייבא עובדים
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          הגדרות עובדים
        </Button>
      </CardContent>
    </Card>
  );
};
