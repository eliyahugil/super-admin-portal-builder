
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { BusinessFormData } from './types';

interface ContactDetailsStepProps {
  formData: BusinessFormData;
  onInputChange: (field: keyof BusinessFormData, value: string) => void;
}

export const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          פרטי יצירת קשר נוספים
        </CardTitle>
        <CardDescription>פרטים נוספים (אופציונלי)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              טלפון
            </Label>
            <Input
              id="phone"
              value={formData.contact_phone}
              onChange={(e) => onInputChange('contact_phone', e.target.value)}
              placeholder="03-1234567"
            />
          </div>
          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="כתובת העסק"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
