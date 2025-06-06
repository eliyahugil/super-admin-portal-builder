
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { useBusinessCloning } from '@/hooks/useBusinessCloning';

export const BusinessCloningDialog: React.FC = () => {
  const { availableBusinesses, isLoading, isCloning, cloneEmployeesToBusiness } = useBusinessCloning();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [open, setOpen] = useState(false);

  const handleClone = async () => {
    if (!selectedBusinessId) return;

    const result = await cloneEmployeesToBusiness(selectedBusinessId);
    if (result) {
      setSelectedBusinessId('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          שכפל עובדים לעסק אחר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>שכפל עובדים לעסק אחר</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="business-select" className="text-sm font-medium">
              בחר עסק יעד
            </label>
            <Select
              value={selectedBusinessId}
              onValueChange={setSelectedBusinessId}
              disabled={isLoading || isCloning}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עסק" />
              </SelectTrigger>
              <SelectContent>
                {availableBusinesses.length === 0 ? (
                  <SelectItem value="no-businesses" disabled>
                    לא נמצאו עסקים זמינים
                  </SelectItem>
                ) : (
                  availableBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>מה יישכפל:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>כל העובדים הפעילים</li>
              <li>פרטים אישיים (שם, טלפון, מייל)</li>
              <li>סוג עובד ושעות שבועיות</li>
              <li>כתובת והערות</li>
              <li>הערה על המקור המקורי</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCloning}
            >
              ביטול
            </Button>
            <Button
              onClick={handleClone}
              disabled={!selectedBusinessId || isCloning || availableBusinesses.length === 0}
              className="flex items-center gap-2"
            >
              {isCloning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  משכפל...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  אשר שכפול
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
