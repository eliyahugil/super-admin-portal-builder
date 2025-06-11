
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PenTool, Download, Eye } from 'lucide-react';

interface DigitalSignaturesProps {
  agreements: any[];
}

export const DigitalSignatures: React.FC<DigitalSignaturesProps> = ({
  agreements
}) => {
  const signedAgreements = agreements.filter(agreement => agreement.status === 'signed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">חתימות דיגיטליות</h3>
        <div className="flex gap-2">
          <Badge variant="outline">
            {signedAgreements.length} הסכמים חתומים
          </Badge>
        </div>
      </div>

      {signedAgreements.length === 0 ? (
        <div className="text-center py-8">
          <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין חתימות דיגיטליות</h3>
          <p className="text-gray-600">כאשר הסכמים יחתמו, הם יופיעו כאן</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signedAgreements.map((agreement) => (
            <Card key={agreement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{agreement.title}</CardTitle>
                  <Badge variant="secondary">
                    <PenTool className="h-3 w-3 mr-1" />
                    חתום
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  לקוח: {agreement.customer?.name || 'לא ידוע'}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-600">תאריך חתימה:</p>
                    <p className="font-medium">
                      {new Date(agreement.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600">מזהה חתימה:</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                      {agreement.id.substring(0, 8)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      צפה
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      הורד
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <PenTool className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">אבטחת חתימות דיגיטליות</h4>
              <p className="text-sm text-blue-800">
                כל החתימות הדיגיטליות במערכת מוצפנות ומאובטחות. 
                כל חתימה כוללת חותמת זמן ומזהה ייחודי לאימות.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
