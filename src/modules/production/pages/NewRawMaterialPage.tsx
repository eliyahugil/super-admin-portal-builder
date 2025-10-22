import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, Leaf } from 'lucide-react';

export const NewRawMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    current_stock: '',
    min_stock: '',
    supplier: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('raw_materials').insert({
        business_id: businessId,
        material_name: formData.name,
        unit: formData.unit,
        current_stock: Number(formData.current_stock),
        min_stock: Number(formData.min_stock),
        supplier: formData.supplier || null,
      });

      if (error) throw error;

      toast.success('חומר גלם נוסף בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      navigate('/production/materials');
    } catch (error: any) {
      toast.error('שגיאה בהוספת חומר גלם: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Leaf className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">חומר גלם חדש</h1>
          <p className="text-muted-foreground">הוספת חומר גלם למלאי</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי חומר גלם</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם חומר הגלם *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="לדוגמה: חלב טרי"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">יחידת מידה *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר יחידת מידה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">ק״ג</SelectItem>
                  <SelectItem value="liter">ליטר</SelectItem>
                  <SelectItem value="unit">יחידות</SelectItem>
                  <SelectItem value="gram">גרם</SelectItem>
                  <SelectItem value="ml">מ״ל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">מלאי נוכחי *</Label>
              <Input
                id="current_stock"
                type="number"
                step="0.01"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="כמות במלאי"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">מלאי מינימום *</Label>
              <Input
                id="min_stock"
                type="number"
                step="0.01"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="רמת מלאי להתראה"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">ספק</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="שם הספק"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור חומר גלם'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/materials')}
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
