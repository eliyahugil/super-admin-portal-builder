
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import type { Customer } from '@/types/customers';

const agreementSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  content: z.string().min(10, 'תוכן ההסכם חייב להכיל לפחות 10 תווים'),
  customer_id: z.string().min(1, 'חובה לבחור לקוח'),
  type: z.enum(['service', 'purchase', 'rental', 'other']),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

type AgreementFormData = z.infer<typeof agreementSchema>;

interface CreateAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
}

export const CreateAgreementDialog: React.FC<CreateAgreementDialogProps> = ({
  open,
  onOpenChange,
  customers
}) => {
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      type: 'service'
    }
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('customer_agreements')
        .insert({
          ...data,
          business_id: businessId,
          status: 'draft'
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'הצלחה',
        description: 'ההסכם נוצר בהצלחה'
      });

      reset();
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating agreement:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את ההסכם',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>יצירת הסכם חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">כותרת ההסכם</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="הכנס כותרת להסכם"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_id">לקוח</Label>
              <Select onValueChange={(value) => setValue('customer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customer_id && (
                <p className="text-sm text-red-600 mt-1">{errors.customer_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">סוג הסכם</Label>
              <Select onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">הסכם שירות</SelectItem>
                  <SelectItem value="purchase">הסכם רכישה</SelectItem>
                  <SelectItem value="rental">הסכם השכרה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valid_from">תוקף מתאריך</Label>
              <Input
                id="valid_from"
                type="date"
                {...register('valid_from')}
              />
            </div>

            <div>
              <Label htmlFor="valid_until">תוקף עד תאריך</Label>
              <Input
                id="valid_until"
                type="date"
                {...register('valid_until')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">תוכן ההסכם</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="הכנס את תוכן ההסכם כאן..."
              rows={12}
              className="min-h-[300px]"
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'יוצר...' : 'צור הסכם'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
