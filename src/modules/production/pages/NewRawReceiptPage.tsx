import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useRawMaterials } from '../hooks/useRawMaterials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, FileText } from 'lucide-react';

export const NewRawReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const { data: materials } = useRawMaterials();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    raw_material_id: '',
    supplier: '',
    received_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: '',
    lot_number: '',
    expiry_date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('raw_material_receipts').insert({
        business_id: businessId,
        material_name: formData.raw_material_id, // Using raw_material_id as material_name for now
        supplier_name: formData.supplier,
        received_date: formData.received_date,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        lot_code: formData.lot_number || null,
        expiration_date: formData.expiry_date || null,
      });

      if (error) throw error;

      toast.success('קבלה נוצרה בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['raw-material-receipts'] });
      navigate('/production/raw-receipts');
    } catch (error: any) {
      toast.error('שגיאה ביצירת קבלה: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">קבלה חדשה</h1>
          <p className="text-muted-foreground">רישום קבלת חומרי גלם</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי קבלה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="raw_material_id">חומר גלם *</Label>
              <Select
                value={formData.raw_material_id}
                onValueChange={(value) => setFormData({ ...formData, raw_material_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר חומר גלם" />
                </SelectTrigger>
                <SelectContent>
                  {materials?.map((material: any) => (
                    <SelectItem key={material.id} value={material.material_name}>
                      {material.material_name} ({material.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">ספק *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="שם הספק"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_date">תאריך קבלה *</Label>
              <Input
                id="received_date"
                type="date"
                value={formData.received_date}
                onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">כמות *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="כמות"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">יחידה *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר יחידה" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot_number">מספר לוט</Label>
              <Input
                id="lot_number"
                value={formData.lot_number}
                onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                placeholder="מספר לוט/אצווה"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">תאריך תפוגה</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור קבלה'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/raw-receipts')}
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
