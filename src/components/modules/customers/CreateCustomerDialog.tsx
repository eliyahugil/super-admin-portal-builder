
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

const customerSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
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
  const { businessId } = useBusiness();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_type: 'individual'
    }
  });

  const customerType = watch('customer_type');

  const onSubmit = async (data: CustomerFormData) => {
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
        .from('customers')
        .insert({
          ...data,
          business_id: businessId,
          is_active: true
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'הצלחה',
        description: 'הלקוח נוצר בהצלחה'
      });

      reset();
      onOpenChange(false);
      onSuccess();

    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את הלקוח',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>הוספת לקוח חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_type">סוג לקוח</Label>
              <Select
                value={customerType}
                onValueChange={(value) => setValue('customer_type', value as 'individual' | 'business')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">לקוח פרטי</SelectItem>
                  <SelectItem value="business">עסק</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">
                {customerType === 'business' ? 'שם העסק' : 'שם מלא'}
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={customerType === 'business' ? 'הכנס שם העסק' : 'הכנס שם מלא'}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="customer@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="050-1234567"
              />
            </div>
          </div>

          {customerType === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person">איש קשר</Label>
                <Input
                  id="contact_person"
                  {...register('contact_person')}
                  placeholder="שם איש הקשר"
                />
              </div>

              <div>
                <Label htmlFor="tax_id">ח.פ / ע.מ</Label>
                <Input
                  id="tax_id"
                  {...register('tax_id')}
                  placeholder="123456789"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="רחוב, מספר, עיר"
            />
          </div>

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="הערות נוספות על הלקוח..."
              rows={3}
            />
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
              {isSubmitting ? 'יוצר...' : 'צור לקוח'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
