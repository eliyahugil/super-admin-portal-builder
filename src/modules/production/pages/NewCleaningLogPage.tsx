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
import { ArrowRight, Sparkles } from 'lucide-react';

export const NewCleaningLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    area: '',
    cleaning_date: new Date().toISOString().split('T')[0],
    cleaning_type: '',
    cleaning_agent: '',
    cleaned_by: '',
    verified_by: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('cleaning_logs').insert({
        business_id: businessId,
        area_name: formData.area,
        cleaning_date: formData.cleaning_date,
        cleaning_type: formData.cleaning_type,
        cleaning_products_used: formData.cleaning_agent || null,
        cleaned_by: formData.cleaned_by,
        verified_by: formData.verified_by || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('רישום ניקיון נוצר בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['cleaning-logs'] });
      navigate('/production/cleaning');
    } catch (error: any) {
      toast.error('שגיאה ברישום ניקיון: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">רישום ניקיון חדש</h1>
          <p className="text-muted-foreground">תיעוד פעולת ניקיון והיגיינה</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי ניקיון</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">אזור *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="לדוגמה: קו ייצור A, אזור אריזה"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaning_date">תאריך ניקיון *</Label>
              <Input
                id="cleaning_date"
                type="date"
                value={formData.cleaning_date}
                onChange={(e) => setFormData({ ...formData, cleaning_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaning_type">סוג ניקיון *</Label>
              <Select
                value={formData.cleaning_type}
                onValueChange={(value) => setFormData({ ...formData, cleaning_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג ניקיון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">יומי</SelectItem>
                  <SelectItem value="weekly">שבועי</SelectItem>
                  <SelectItem value="deep">עמוק</SelectItem>
                  <SelectItem value="sanitation">חיטוי</SelectItem>
                  <SelectItem value="emergency">חירום</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaning_agent">חומר ניקוי</Label>
              <Input
                id="cleaning_agent"
                value={formData.cleaning_agent}
                onChange={(e) => setFormData({ ...formData, cleaning_agent: e.target.value })}
                placeholder="שם חומר הניקוי"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaned_by">בוצע על ידי *</Label>
              <Input
                id="cleaned_by"
                value={formData.cleaned_by}
                onChange={(e) => setFormData({ ...formData, cleaned_by: e.target.value })}
                placeholder="שם המנקה"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verified_by">אומת על ידי</Label>
              <Input
                id="verified_by"
                value={formData.verified_by}
                onChange={(e) => setFormData({ ...formData, verified_by: e.target.value })}
                placeholder="שם המאמת"
              />
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
                {isSubmitting ? 'שומר...' : 'שמור רישום'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/cleaning')}
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
