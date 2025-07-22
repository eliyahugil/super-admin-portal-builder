import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface FormData {
  createEmployee: boolean;
  notes: string;
}

interface Props {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (createEmployee: boolean, notes?: string) => void;
}

export const ApproveRequestDialog: React.FC<Props> = ({
  request,
  open,
  onOpenChange,
  onApprove,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      createEmployee: true,
      notes: '',
    }
  });

  const createEmployee = watch('createEmployee');

  const onSubmit = (data: FormData) => {
    onApprove(data.createEmployee, data.notes || undefined);
    reset();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            אישור בקשת רישום
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="font-semibold text-lg">
              {request.first_name} {request.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {request.email} • {request.id_number}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Create Employee Option */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="createEmployee" className="text-base font-medium">
                    יצירת עובד במערכת
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    האם ליצור עובד חדש במערכת על בסיס הפרטים שהוגשו?
                  </p>
                </div>
                <Switch
                  id="createEmployee"
                  {...register('createEmployee')}
                />
              </div>

              {createEmployee && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <UserPlus className="h-4 w-4" />
                    עובד חדש ייווצר עם הפרטים הבאים:
                  </div>
                  <ul className="mt-2 text-sm text-blue-600 space-y-1">
                    <li>• שם: {request.first_name} {request.last_name}</li>
                    <li>• תעודת זהות: {request.id_number}</li>
                    <li>• דוא"ל: {request.email}</li>
                    {request.phone && <li>• טלפון: {request.phone}</li>}
                    <li>• תאריך לידה: {new Date(request.birth_date).toLocaleDateString('he-IL')}</li>
                    <li>• סטטוס: לא פעיל (עד אישור סופי)</li>
                  </ul>
                </div>
              )}

              {!createEmployee && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-yellow-700 font-medium">
                    הבקשה תאושר ללא יצירת עובד במערכת
                  </div>
                  <p className="mt-1 text-sm text-yellow-600">
                    תוכל ליצור את העובד מאוחר יותר באופן ידני
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">הערות לאישור (אופציונלי)</Label>
              <Textarea
                id="notes"
                placeholder="הערות או הוראות נוספות לעובד החדש..."
                rows={3}
                {...register('notes')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                ביטול
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                אשר בקשה
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};