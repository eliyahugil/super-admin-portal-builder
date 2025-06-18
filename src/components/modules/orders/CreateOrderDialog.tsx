
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderDialogProps {
  onOrderCreated?: () => void;
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ onOrderCreated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    order_type: 'delivery',
    delivery_address: '',
    pickup_location: '',
    total_amount: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // כאן נוסיף את הלוגיקה לשמירת ההזמנה
    console.log('Creating order:', formData);
    
    toast({
      title: 'הצלחה',
      description: 'ההזמנה נוצרה בהצלחה',
    });
    
    setOpen(false);
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      order_type: 'delivery',
      delivery_address: '',
      pickup_location: '',
      total_amount: '',
      notes: ''
    });
    
    onOrderCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הזמנה חדשה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת הזמנה חדשה</DialogTitle>
          <DialogDescription>
            מלא את פרטי ההזמנה החדשה
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_name">שם הלקוח *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="customer_phone">טלפון</Label>
            <Input
              id="customer_phone"
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="customer_email">אימייל</Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="order_type">סוג הזמנה *</Label>
            <Select value={formData.order_type} onValueChange={(value) => setFormData({...formData, order_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">משלוח</SelectItem>
                <SelectItem value="pickup">איסוף עצמי</SelectItem>
                <SelectItem value="dine_in">במקום</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.order_type === 'delivery' && (
            <div>
              <Label htmlFor="delivery_address">כתובת למשלוח *</Label>
              <Input
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                required
              />
            </div>
          )}

          {formData.order_type === 'pickup' && (
            <div>
              <Label htmlFor="pickup_location">מקום איסוף</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
              />
            </div>
          )}

          <div>
            <Label htmlFor="total_amount">סכום כולל *</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit">
              צור הזמנה
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
