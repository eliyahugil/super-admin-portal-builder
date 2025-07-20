import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi } from 'lucide-react';
import { WhatsAppConnection } from '@/components/whatsapp/WhatsAppConnection';
import { WhatsAppProvider } from '@/context/WhatsAppContext';

interface WhatsAppIntegrationFormProps {
  businessId?: string;
  viewMode?: 'merged' | 'tabs';
  onSave?: (data: any) => void;
}

export const WhatsAppIntegrationForm: React.FC<WhatsAppIntegrationFormProps> = ({
  businessId,
  viewMode = 'merged',
  onSave
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">WhatsApp Business</CardTitle>
                <CardDescription className="text-sm">
                  חיבור ישיר ל-WhatsApp Business עבור שליחה וקבלת הודעות
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              חיבור ישיר
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {businessId && (
            <WhatsAppProvider businessId={businessId}>
              <WhatsAppConnection />
            </WhatsAppProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
};