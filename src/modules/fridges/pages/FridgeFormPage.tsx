import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Fridge } from '@/types/fridges';
import { useCreateFridge, useUpdateFridge } from '../hooks/useFridges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export default function FridgeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  const [form, setForm] = useState<Partial<Fridge>>({
    type: 'מקרר',
    is_active: true,
    min_temp: 0,
    max_temp: 5,
  } as any);

  const isEdit = Boolean(id);
  const createMut = useCreateFridge();
  const updateMut = useUpdateFridge();

  useEffect(() => {
    if (!isEdit || !id) return;
    supabase.from('fridges').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) toast.error(error.message);
      else if (data) setForm(data as Fridge);
    });
  }, [id, isEdit]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.min_temp === undefined || form.max_temp === undefined) {
      toast.error('שם, מינימום ומקסימום טמפ׳ הם שדות חובה');
      return;
    }

    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, ...form });
        toast.success('מקרר עודכן בהצלחה');
      } else {
        await createMut.mutateAsync({ ...form, business_id: businessId } as any);
        toast.success('מקרר נוצר בהצלחה');
      }
      navigate('/fridges');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת מקרר' : 'מקרר חדש'}</h1>
      <Card className="p-6">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם</label>
            <Input value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="מקרר ויטרינה 1" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">סוג</label>
            <Select value={form.type ?? 'מקרר'} onValueChange={(v) => setForm((f) => ({ ...f, type: v as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מקרר">מקרר</SelectItem>
                <SelectItem value="מקפיא">מקפיא</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">מיקום</label>
            <Input value={form.location ?? ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="ביג קריות - ויטרינה" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">טמפ׳ מינימלית</label>
              <Input type="number" step="0.1" value={form.min_temp ?? ''} onChange={(e) => setForm((f) => ({ ...f, min_temp: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">טמפ׳ מקסימלית</label>
              <Input type="number" step="0.1" value={form.max_temp ?? ''} onChange={(e) => setForm((f) => ({ ...f, max_temp: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={form.is_active ?? true} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: !!v }))} />
            <span className="text-sm">פעיל</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">הערות</label>
            <Textarea value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="min-h-[80px]" />
          </div>

          <div className="flex gap-3">
            <Button type="submit">שמור</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/fridges')}>
              ביטול
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
