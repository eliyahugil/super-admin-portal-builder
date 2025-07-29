import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { useEmployeeRegistrationTokens } from '@/hooks/useEmployeeRegistrationTokens';

interface FormData {
  title: string;
  description: string;
  hasExpiration: boolean;
  expires_at: string;
  hasMaxRegistrations: boolean;
  max_registrations: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenCreated: () => void;
}

export const CreateRegistrationTokenDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onTokenCreated,
}) => {
  const { createToken, isCreating } = useEmployeeRegistrationTokens();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      hasExpiration: false,
      expires_at: '',
      hasMaxRegistrations: false,
      max_registrations: 10,
    }
  });

  const hasExpiration = watch('hasExpiration');
  const hasMaxRegistrations = watch('hasMaxRegistrations');

  const onSubmit = (data: FormData) => {
    const tokenData = {
      title: data.title,
      description: data.description || undefined,
      expires_at: data.hasExpiration && data.expires_at 
        ? new Date(data.expires_at).toISOString() 
        : undefined,
      max_registrations: data.hasMaxRegistrations 
        ? data.max_registrations 
        : undefined,
    };

    createToken(tokenData);
    reset();
    onTokenCreated();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת טוקן הוספת עובדים</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">כותרת הטוקן *</Label>
            <Input
              id="title"
              placeholder="למשל: רישום עובדים חדשים - חורף 2024"
              {...register('title', { 
                required: 'שדה חובה' 
              })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              placeholder="תיאור קצר של מטרת הטוקן"
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasExpiration">הגדרת תאריך תפוגה</Label>
              <Switch
                id="hasExpiration"
                checked={hasExpiration}
                onCheckedChange={(checked) => {
                  register('hasExpiration').onChange({ target: { value: checked } });
                }}
              />
            </div>
            
            {hasExpiration && (
              <div className="space-y-2">
                <Label htmlFor="expires_at">תאריך תפוגה</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  {...register('expires_at', {
                    required: hasExpiration ? 'שדה חובה כאשר מוגדר תאריך תפוגה' : false
                  })}
                />
                {errors.expires_at && (
                  <p className="text-sm text-destructive">{errors.expires_at.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Max Registrations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasMaxRegistrations">הגבלת מספר הרשמות</Label>
              <Switch
                id="hasMaxRegistrations"
                checked={hasMaxRegistrations}
                onCheckedChange={(checked) => {
                  register('hasMaxRegistrations').onChange({ target: { value: checked } });
                }}
              />
            </div>
            
            {hasMaxRegistrations && (
              <div className="space-y-2">
                <Label htmlFor="max_registrations">מספר הרשמות מקסימלי</Label>
                <Input
                  id="max_registrations"
                  type="number"
                  min="1"
                  max="1000"
                  {...register('max_registrations', {
                    required: hasMaxRegistrations ? 'שדה חובה' : false,
                    min: { value: 1, message: 'המספר חייב להיות לפחות 1' },
                    max: { value: 1000, message: 'המספר חייב להיות עד 1000' }
                  })}
                />
                {errors.max_registrations && (
                  <p className="text-sm text-destructive">{errors.max_registrations.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isCreating}
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
            >
              {isCreating ? 'יוצר...' : 'צור טוקן'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};