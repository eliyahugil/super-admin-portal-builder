
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import type { Customer } from '@/types/customers';

const agreementSchema = z.object({
  customer_id: z.string().min(1, 'בחירת לקוח חובה'),
  title: z.string().min(1, 'כותרת חובה'),
  content: z.string().min(1, 'תוכן ההסכם חובה'),
  type: z.enum(['service', 'purchase', 'rental', 'other']),
  status: z.enum(['draft', 'active', 'signed', 'expired']),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

type AgreementFormData = z.infer<typeof agreementSchema>;

interface CreateAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customers: Customer[];
}

export const CreateAgreementDialog: React.FC<CreateAgreementDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  customers
}) => {
  const { toast } = useToast();
  const { businessId } = useBusiness();
  
  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      type: 'service',
      status: 'draft',
    },
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive',
        });
        return;
      }

      const agreementData = {
        business_id: businessId,
        customer_id: data.customer_id,
        title: data.title,
        content: data.content,
        type: data.type,
        status: data.status,
        valid_from: data.valid_from || null,
        valid_until: data.valid_until || null,
      };

      const { error } = await supabase
        .from('customer_agreements')
        .insert(agreementData);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'ההסכם נוצר בהצלחה',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating agreement:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת ההסכם',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>יצירת הסכם חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="customer_id">לקוח *</Label>
            <Select
              value={form.watch('customer_id')}
              onValueChange={(value) => form.setValue('customer_id', value)}
            >
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
            {form.formState.errors.customer_id && (
              <p className="text-sm text-red-500">{form.formState.errors.customer_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="הכנס כותרת להסכם"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">תוכן ההסכם *</Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder="הכנס את תוכן ההסכם"
              className="min-h-[100px]"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">סוג הסכם</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as 'service' | 'purchase' | 'rental' | 'other')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">שירות</SelectItem>
                <SelectItem value="purchase">קנייה</SelectItem>
                <SelectItem value="rental">השכרה</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">סטטוס</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'draft' | 'active' | 'signed' | 'expired')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">טיוטה</SelectItem>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="signed">חתום</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">תוקף מתאריך</Label>
              <Input
                id="valid_from"
                type="date"
                {...form.register('valid_from')}
              />
            </div>

            <div>
              <Label htmlFor="valid_until">תוקף עד תאריך</Label>
              <Input
                id="valid_until"
                type="date"
                {...form.register('valid_until')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
