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
import { ArrowRight, ClipboardCheck } from 'lucide-react';

export const NewQualityCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    batch_id: '',
    check_date: new Date().toISOString().split('T')[0],
    check_type: '',
    result: 'passed' as 'passed' | 'failed' | 'conditional',
    notes: '',
    checked_by: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);
    try {
      const notesWithInspector = formData.notes 
        ? `${formData.notes}\n\nנבדק על ידי: ${formData.checked_by}`
        : `נבדק על ידי: ${formData.checked_by}`;

      const { error } = await supabase.from('quality_checks').insert({
        business_id: businessId,
        batch_id: formData.batch_id || null,
        check_date: formData.check_date,
        check_type: formData.check_type,
        passed: formData.result === 'passed',
        notes: notesWithInspector,
      });

      if (error) throw error;

      toast.success('בדיקה נוצרה בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['quality-checks'] });
      navigate('/production/quality');
    } catch (error: any) {
      toast.error('שגיאה ביצירת בדיקה: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">בדיקה חדשה</h1>
          <p className="text-muted-foreground">רישום בדיקת איכות</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי בדיקה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="check_date">תאריך בדיקה *</Label>
              <Input
                id="check_date"
                type="date"
                value={formData.check_date}
                onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_type">סוג בדיקה *</Label>
              <Select
                value={formData.check_type}
                onValueChange={(value) => setFormData({ ...formData, check_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג בדיקה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">בדיקה ויזואלית</SelectItem>
                  <SelectItem value="taste">בדיקת טעם</SelectItem>
                  <SelectItem value="temperature">בדיקת טמפרטורה</SelectItem>
                  <SelectItem value="lab">בדיקת מעבדה</SelectItem>
                  <SelectItem value="packaging">בדיקת אריזה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">תוצאה *</Label>
              <Select
                value={formData.result}
                onValueChange={(value: any) => setFormData({ ...formData, result: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">עבר</SelectItem>
                  <SelectItem value="failed">נכשל</SelectItem>
                  <SelectItem value="conditional">מותנה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checked_by">נבדק על ידי *</Label>
              <Input
                id="checked_by"
                value={formData.checked_by}
                onChange={(e) => setFormData({ ...formData, checked_by: e.target.value })}
                placeholder="שם הבודק"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות ופרטים נוספים"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'שומר...' : 'שמור בדיקה'}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/production/quality')}
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
