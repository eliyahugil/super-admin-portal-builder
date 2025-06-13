
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

const customerSchema = z.object({
  name: z.string().min(1, 'שם הלקוח חובה'),
  email: z.string().email('כתובת מייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  contact_person: z.string().optional(),
  customer_type: z.enum(['individual', 'business']),
  tax_id: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const { businessId } = useBusiness();
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_type: 'individual',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (!businessId) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא מזהה עסק',
          variant: 'destructive',
        });
        return;
      }

      const customerData = {
        business_id: businessId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        company: data.company || null,
        contact_person: data.contact_person || null,
        customer_type: data.customer_type,
        tax_id: data.tax_id || null,
        notes: data.notes || null,
        is_active: true,
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'הלקוח נוצר בהצלחה',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הלקוח',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת לקוח חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">שם הלקוח *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="הכנס שם לקוח"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_type">סוג לקוח</Label>
            <Select
              value={form.watch('customer_type')}
              onValueChange={(value) => form.setValue('customer_type', value as 'individual' | 'business')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">פרטי</SelectItem>
                <SelectItem value="business">עסקי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="הכנס כתובת מייל"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="הכנס מספר טלפון"
            />
          </div>

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="הכנס כתובת"
            />
          </div>

          {form.watch('customer_type') === 'business' && (
            <>
              <div>
                <Label htmlFor="company">שם החברה</Label>
                <Input
                  id="company"
                  {...form.register('company')}
                  placeholder="הכנס שם חברה"
                />
              </div>

              <div>
                <Label htmlFor="contact_person">איש קשר</Label>
                <Input
                  id="contact_person"
                  {...form.register('contact_person')}
                  placeholder="הכנס שם איש קשר"
                />
              </div>

              <div>
                <Label htmlFor="tax_id">מספר עוסק מורשה</Label>
                <Input
                  id="tax_id"
                  {...form.register('tax_id')}
                  placeholder="הכנס מספר עוסק מורשה"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="הכנס הערות"
            />
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
