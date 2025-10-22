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
import { ArrowRight, Wrench } from 'lucide-react';

export const NewEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    equipment_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    installation_date: '',
    status: 'operational' as 'operational' | 'maintenance' | 'broken' | 'retired',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('production_equipment').insert({
        business_id: businessId,
        equipment_name: formData.name,
        equipment_type: formData.equipment_type,
        equipment_code: formData.serial_number || null,
        purchase_date: formData.installation_date || null,
        status: formData.status,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('ציוד נוסף בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['production-equipment'] });
      navigate('/production/equipment');
    } catch (error: any) {
      toast.error('שגיאה בהוספת ציוד: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">ציוד חדש</h1>
          <p className="text-muted-foreground">הוספת ציוד ייצור למערכת</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי ציוד</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם הציוד *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="לדוגמה: מכונת אריזה #1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_type">סוג ציוד *</Label>
              <Select
                value={formData.equipment_type}
                onValueChange={(value) => setFormData({ ...formData, equipment_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג ציוד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixer">מערבל</SelectItem>
                  <SelectItem value="oven">תנור</SelectItem>
                  <SelectItem value="cooler">מצנן</SelectItem>
                  <SelectItem value="packaging">מכונת אריזה</SelectItem>
                  <SelectItem value="conveyor">מסוע</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">יצרן</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="שם היצרן"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">דגם</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="דגם הציוד"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">מספר סידורי</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="S/N"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installation_date">תאריך התקנה</Label>
              <Input
                id="installation_date"
                type="date"
                value={formData.installation_date}
                onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
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
                  <SelectItem value="operational">תקין</SelectItem>
                  <SelectItem value="maintenance">בתחזוקה</SelectItem>
                  <SelectItem value="broken">מקולקל</SelectItem>
                  <SelectItem value="retired">הוצא משימוש</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות ופרטים נוספים"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור ציוד'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/equipment')}
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
