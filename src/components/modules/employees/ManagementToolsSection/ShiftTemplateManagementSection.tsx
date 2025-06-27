
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickShiftTemplateCreatorDialog } from '../CreateShiftForm/QuickShiftTemplateCreatorDialog';
import { ShiftTemplateManagementSectionProps } from './types';

export const ShiftTemplateManagementSection: React.FC<ShiftTemplateManagementSectionProps> = ({ 
  selectedBusinessId 
}) => {
  const [open, setOpen] = React.useState(false);

  const handleTemplateCreated = () => {
    console.log('✅ Template created for business:', selectedBusinessId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          ניהול תבניות משמרות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" dir="rtl">
          <p className="text-sm text-gray-600">
            צור תבניות משמרות מהירות לשימוש חוזר
          </p>
          
          <Button
            onClick={() => setOpen(true)}
            type="button"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            הוספת תבנית מהירה
          </Button>
          
          <QuickShiftTemplateCreatorDialog
            open={open}
            onOpenChange={setOpen}
            businessId={selectedBusinessId || ''}
            onTemplateCreated={handleTemplateCreated}
          />
        </div>
      </CardContent>
    </Card>
  );
};
