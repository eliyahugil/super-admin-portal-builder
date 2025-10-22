import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, Package2 } from 'lucide-react';

export const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    product_type: '',
    description: '',
    shelf_life_days: '',
    storage_temp_min: '',
    storage_temp_max: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('products').insert({
        business_id: businessId,
        name: formData.name,
        product_type: formData.product_type,
        description: formData.description || null,
        shelf_life_days: formData.shelf_life_days ? Number(formData.shelf_life_days) : null,
        storage_temp_min: formData.storage_temp_min ? Number(formData.storage_temp_min) : null,
        storage_temp_max: formData.storage_temp_max ? Number(formData.storage_temp_max) : null,
      });

      if (error) throw error;

      toast.success('מוצר נוסף בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/production/products');
    } catch (error: any) {
      toast.error('שגיאה בהוספת מוצר: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Package2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">מוצר חדש</h1>
          <p className="text-muted-foreground">הוספת מוצר ייצור חדש</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי מוצר</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם המוצר *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="לדוגמה: חלב טרי 3%"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type">סוג מוצר *</Label>
              <Select
                value={formData.product_type}
                onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג מוצר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dairy">חלב ומוצריו</SelectItem>
                  <SelectItem value="bakery">מאפים</SelectItem>
                  <SelectItem value="meat">בשר ועופות</SelectItem>
                  <SelectItem value="frozen">מזון קפוא</SelectItem>
                  <SelectItem value="ready_meal">ארוחות מוכנות</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור המוצר והערות"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelf_life_days">חיי מדף (ימים)</Label>
              <Input
                id="shelf_life_days"
                type="number"
                value={formData.shelf_life_days}
                onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                placeholder="מספר ימים"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storage_temp_min">טמפ׳ אחסון מינימום (°C)</Label>
                <Input
                  id="storage_temp_min"
                  type="number"
                  value={formData.storage_temp_min}
                  onChange={(e) => setFormData({ ...formData, storage_temp_min: e.target.value })}
                  placeholder="-5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_temp_max">טמפ׳ אחסון מקסימום (°C)</Label>
                <Input
                  id="storage_temp_max"
                  type="number"
                  value={formData.storage_temp_max}
                  onChange={(e) => setFormData({ ...formData, storage_temp_max: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור מוצר'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/products')}
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
