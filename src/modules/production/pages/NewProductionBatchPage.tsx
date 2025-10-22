import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useProducts } from '../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, Package } from 'lucide-react';

export const NewProductionBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    product_id: '',
    batch_number: '',
    production_date: new Date().toISOString().split('T')[0],
    planned_quantity: '',
    actual_quantity: '',
    status: 'planned' as 'planned' | 'in_progress' | 'completed' | 'cancelled',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('production_batches').insert({
        business_id: businessId,
        product_name: formData.product_id, // Using product_id as product_name for now
        batch_number: formData.batch_number,
        production_date: formData.production_date,
        planned_quantity: Number(formData.planned_quantity),
        actual_quantity: formData.actual_quantity ? Number(formData.actual_quantity) : null,
        status: formData.status,
        unit: 'units',
      });

      if (error) throw error;

      toast.success('אצווה נוצרה בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['production-batches'] });
      navigate('/production/batches');
    } catch (error: any) {
      toast.error('שגיאה ביצירת אצווה: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">אצווה חדשה</h1>
          <p className="text-muted-foreground">הוספת אצוות ייצור חדשה</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי אצווה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">מוצר *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מוצר" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">מספר אצווה *</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="לדוגמה: BATCH-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="production_date">תאריך ייצור *</Label>
              <Input
                id="production_date"
                type="date"
                value={formData.production_date}
                onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planned_quantity">כמות מתוכננת *</Label>
              <Input
                id="planned_quantity"
                type="number"
                value={formData.planned_quantity}
                onChange={(e) => setFormData({ ...formData, planned_quantity: e.target.value })}
                placeholder="כמות ביחידות"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_quantity">כמות בפועל</Label>
              <Input
                id="actual_quantity"
                type="number"
                value={formData.actual_quantity}
                onChange={(e) => setFormData({ ...formData, actual_quantity: e.target.value })}
                placeholder="כמות ביחידות"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">מתוכנן</SelectItem>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור אצווה'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/batches')}
              >
                ביטול
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
