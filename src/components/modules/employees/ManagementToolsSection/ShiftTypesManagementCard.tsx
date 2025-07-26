import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings, Calendar, Plus } from 'lucide-react';
import { BusinessShiftTypesManager } from '@/components/modules/business/shift-types/BusinessShiftTypesManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ShiftTypesManagementCardProps {
  selectedBusinessId?: string | null;
}

export const ShiftTypesManagementCard: React.FC<ShiftTypesManagementCardProps> = ({
  selectedBusinessId
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!selectedBusinessId) {
    return null;
  }

  return (
    <Card className="h-full border-orange-200 bg-orange-50/50 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 text-sm font-medium">
          <Clock className="h-4 w-4" />
          ניהול סוגי משמרות
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs text-orange-700">
          <p className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            הגדרת משמרות מותאמות
          </p>
          <p className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            צבעים וטווחי זמנים
          </p>
        </div>
        
        <div className="pt-2">
          <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
            ⚠️ חשוב לעדכן משמרות ערב מ-14:00
          </Badge>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              נהל סוגי משמרות
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                ניהול סוגי משמרות
              </DialogTitle>
            </DialogHeader>
            <BusinessShiftTypesManager />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};