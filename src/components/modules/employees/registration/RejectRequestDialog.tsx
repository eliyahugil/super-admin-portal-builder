import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface FormData {
  rejection_reason: string;
}

interface Props {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => void;
}

export const RejectRequestDialog: React.FC<Props> = ({
  request,
  open,
  onOpenChange,
  onReject,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      rejection_reason: '',
    }
  });

  const onSubmit = (data: FormData) => {
    onReject(data.rejection_reason);
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
            <XCircle className="h-5 w-5 text-destructive" />
            דחיית בקשת רישום
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

          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="text-destructive font-medium">
              ⚠️ דחיית הבקשה
            </div>
            <p className="mt-1 text-sm text-destructive/80">
              בקשת הרישום תסומן כנדחית ולא ניתן יהיה לבטל פעולה זו.
              העובד יקבל התראה על דחיית הבקשה.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rejection Reason */}
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">סיבת הדחייה *</Label>
              <Textarea
                id="rejection_reason"
                placeholder="אנא פרט את הסיבה לדחיית הבקשה..."
                rows={4}
                {...register('rejection_reason', { 
                  required: 'חובה לציין סיבת דחייה',
                  minLength: { 
                    value: 10, 
                    message: 'הסיבה חייבת להכיל לפחות 10 תווים' 
                  }
                })}
              />
              {errors.rejection_reason && (
                <p className="text-sm text-destructive">
                  {errors.rejection_reason.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                הסיבה תישלח לעובד ותוצג במערכת
              </p>
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
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                דחה בקשה
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};