
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

export const BusinessProfile: React.FC = () => {
  const [address, setAddress] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">פרטי עסק</h1>
        <p className="text-gray-600 mt-2">עדכן את פרטי העסק</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>מידע בסיסי</CardTitle>
            <CardDescription>פרטי העסק הבסיסיים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>שם העסק</Label>
                <Input placeholder="שם העסק" />
              </div>
              <div>
                <Label>מספר עסק</Label>
                <Input placeholder="123456789" />
              </div>
            </div>
            
            <div>
              <Label>תיאור העסק</Label>
              <Textarea placeholder="תיאור קצר על העסק..." />
            </div>

            <AddressAutocomplete
              label="כתובת העסק"
              value={address}
              onChange={setAddress}
              placeholder="הקלד כתובת העסק..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פרטי יצירת קשר</CardTitle>
            <CardDescription>דרכי יצירת קשר עם העסק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>טלפון</Label>
                <Input placeholder="03-1234567" />
              </div>
              <div>
                <Label>אימייל</Label>
                <Input type="email" placeholder="info@company.com" />
              </div>
            </div>
            
            <div>
              <Label>אתר אינטרנט</Label>
              <Input placeholder="https://www.company.com" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">
          שמור שינויים
        </Button>
      </div>
    </div>
  );
};
