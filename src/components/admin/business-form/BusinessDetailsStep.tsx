
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, User, Mail, Sparkles } from 'lucide-react';
import { BusinessFormData } from './types';

interface BusinessDetailsStepProps {
  formData: BusinessFormData;
  onInputChange: (field: keyof BusinessFormData, value: string) => void;
}

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              פרטי העסק
            </CardTitle>
            <CardDescription>מידע בסיסי על העסק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">שם העסק *</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="הכנס את שם העסק"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">תיאור העסק</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="תיאור קצר על העסק..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              פרטי המנהל הראשי
            </CardTitle>
            <CardDescription>המנהל יקבל חשבון אוטומטית עם הרשאות מלאות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminName">שם מלא *</Label>
              <Input
                id="adminName"
                value={formData.admin_full_name}
                onChange={(e) => onInputChange('admin_full_name', e.target.value)}
                placeholder="שם המנהל הראשי"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="adminEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                כתובת מייל *
              </Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.admin_email}
                onChange={(e) => onInputChange('admin_email', e.target.value)}
                placeholder="admin@company.com"
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Creation Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">יצירה אוטומטית</span>
          </div>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• המערכת תיצור חשבון אוטומטית למנהל</li>
            <li>• הסיסמה הראשונית: 123456</li>
            <li>• המנהל יקבל הרשאות מלאות לעסק</li>
            <li>• יש להחליף את הסיסמה בהתחברות הראשונה</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
