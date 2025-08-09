
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactDetails {
  contact_email?: string;
  admin_email?: string;
}

interface ContactInfoCardProps {
  details: ContactDetails;
  onDetailsChange: (updates: Partial<ContactDetails>) => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  details,
  onDetailsChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי יצירת קשר</CardTitle>
        <CardDescription>דרכי יצירת קשר עם העסק</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>אימייל ליצירת קשר</Label>
            <Input 
              type="email" 
              value={details.contact_email || ''}
              onChange={(e) => onDetailsChange({ contact_email: e.target.value })}
              placeholder="info@company.com" 
              data-testid="input-contact-email"
            />
          </div>
          <div>
            <Label>אימייל מנהל</Label>
            <Input 
              type="email" 
              value={details.admin_email || ''}
              onChange={(e) => onDetailsChange({ admin_email: e.target.value })}
              placeholder="admin@company.com" 
              data-testid="input-admin-email"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
