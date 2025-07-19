import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ManagerOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  conflictDetails: {
    employeeName?: string;
    currentShiftTime?: string;
    conflictingShifts?: Array<{ start_time: string; end_time: string }>;
    date?: string;
    branchName?: string;
  };
}

export const ManagerOverrideDialog: React.FC<ManagerOverrideDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conflictDetails
}) => {
  const [managerCode, setManagerCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!managerCode.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(managerCode);
      setManagerCode('');
      onClose();
    } catch (error) {
      console.error('Manager override failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setManagerCode('');
    onClose();
  };

  const conflictTimes = conflictDetails.conflictingShifts?.map(s => 
    `${s.start_time}-${s.end_time}`
  ).join(', ') || '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            אזהרת קונפליקט משמרות
          </DialogTitle>
          <DialogDescription className="text-right space-y-2">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="font-medium text-orange-800 mb-2">
                ⚠️ העובד כבר משויך למשמרת באותו יום באותו סניף
              </p>
              <div className="text-sm text-orange-700">
                <p><strong>עובד:</strong> {conflictDetails.employeeName || 'לא צוין'}</p>
                <p><strong>תאריך:</strong> {conflictDetails.date || 'לא צוין'}</p>
                <p><strong>סניף:</strong> {conflictDetails.branchName || 'לא צוין'}</p>
                <p><strong>משמרות קיימות:</strong> {conflictTimes}</p>
                <p><strong>משמרת חדשה:</strong> {conflictDetails.currentShiftTime || 'לא צוין'}</p>
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="font-medium text-red-800 mb-1">
                🚨 זוהי פעולה יוצאת דופן שדורשת אישור מנהל
              </p>
              <p className="text-sm text-red-700">
                שיוך עובד לשתי משמרות באותו יום באותו סניף יכול לגרום לבעיות תפעוליות.
                השתמש באפשרות זו רק במקרי חירום או בהוראה מפורשת של ההנהלה.
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              על מנת להמשיך, הזן את קוד המנהל:
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="manager-code" className="text-right">
              קוד מנהל *
            </Label>
            <Input
              id="manager-code"
              type="password"
              value={managerCode}
              onChange={(e) => setManagerCode(e.target.value)}
              placeholder="הזן קוד מנהל"
              className="text-center text-lg font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!managerCode.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'מעבד...' : 'אשר שיוך כפול'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};