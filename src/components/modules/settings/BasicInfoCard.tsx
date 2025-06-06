
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { LogoUpload } from './LogoUpload';

interface BasicInfoCardProps {
  details: {
    name: string;
    contact_phone?: string;
    description?: string;
    logo_url?: string;
  };
  onDetailsChange: (updates: Partial<typeof details>) => void;
  address: any;
  onAddressChange: (address: any) => void;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  details,
  onDetailsChange,
  address,
  onAddressChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>מידע בסיסי</CardTitle>
        <CardDescription>פרטי העסק הבסיסיים</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>לוגו העסק</Label>
          <LogoUpload
            currentLogo={details.logo_url}
            onLogoChange={(logoUrl) => onDetailsChange({ logo_url: logoUrl })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>שם העסק</Label>
            <Input 
              value={details.name}
              onChange={(e) => onDetailsChange({ name: e.target.value })}
              placeholder="שם העסק" 
            />
          </div>
          <div>
            <Label>טלפון</Label>
            <Input 
              value={details.contact_phone || ''}
              onChange={(e) => onDetailsChange({ contact_phone: e.target.value })}
              placeholder="03-1234567" 
            />
          </div>
        </div>
        
        <div>
          <Label>תיאור העסק</Label>
          <Textarea 
            value={details.description || ''}
            onChange={(e) => onDetailsChange({ description: e.target.value })}
            placeholder="תיאור קצר על העסק..." 
          />
        </div>

        <AddressAutocomplete
          label="כתובת העסק"
          value={address}
          onChange={onAddressChange}
          placeholder="הקלד כתובת העסק..."
        />
      </CardContent>
    </Card>
  );
};
