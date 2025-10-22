import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Fridge } from '@/types/fridges';
import { useFridgeLogs, useAddFridgeLog } from '../hooks/useFridgeLogs';
import { useFridgeAlerts, useCloseAlert } from '../hooks/useFridgeAlerts';
import { useCorrectiveActions, useAddCorrectiveAction } from '../hooks/useCorrectiveActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function FridgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [fridge, setFridge] = useState<Fridge | null>(null);
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));

  const [temp, setTemp] = useState('');
  const [note, setNote] = useState('');
  const [probeCal, setProbeCal] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('fridges').select('*').eq('id', id).single().then(({ data }) => setFridge(data as Fridge));
  }, [id]);

  const { data: logs = [] } = useFridgeLogs(id!, { from: dateFrom, to: dateTo, limit: 1000 });
  const { data: openAlerts = [] } = useFridgeAlerts(id!, 'פתוחה');
  const { data: actions = [] } = useCorrectiveActions(id!);

  const addLog = useAddFridgeLog();
  const closeAlertMut = useCloseAlert();
  const addActionMut = useAddCorrectiveAction();

  const saveManual = async () => {
    if (!temp || !fridge) return;
    try {
      await addLog.mutateAsync({
        fridge_id: fridge.id,
        business_id: fridge.business_id,
        measured_at: new Date().toISOString(),
        temperature: Number(temp),
        method: 'ידני',
        probe_calibrated: probeCal,
        note,
      });
      setTemp('');
      setNote('');
      setProbeCal(false);
      toast.success('רישום נוסף בהצלחה');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addActionHandler = async (alertId?: string) => {
    if (!action || !fridge) return;
    try {
      await addActionMut.mutateAsync({
        fridge_id: fridge.id,
        business_id: fridge.business_id,
        alert_id: alertId,
        action_time: new Date().toISOString(),
        action_taken: action,
        closed: false,
      });
      setAction('');
      toast.success('פעולה נוספה בהצלחה');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!fridge) return <div className="p-6 text-muted-foreground">טוען...</div>;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground">
        {fridge.name} — {fridge.type} ({fridge.min_temp}°C–{fridge.max_temp}°C)
      </h1>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">מתאריך</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">עד תאריך</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-end gap-2 flex-wrap">
            <Input placeholder="טמפ׳ (°C)" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-32" />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={probeCal} onCheckedChange={(v) => setProbeCal(!!v)} />
              <span>כיול מדחום נבדק</span>
            </label>
            <Input placeholder="הערה" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1 min-w-[200px]" />
            <Button onClick={saveManual} disabled={!temp}>הוסף רישום</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-3">גרף (ערכים אחרונים)</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-start font-medium">זמן</th>
                <th className="p-2 text-start font-medium">טמפ׳</th>
                <th className="p-2 text-start font-medium">שיטה</th>
                <th className="p-2 text-start font-medium">הערה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => {
                const isOutOfRange = l.temperature < fridge.min_temp || l.temperature > fridge.max_temp;
                return (
                  <tr key={l.id} className={isOutOfRange ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <td className="p-2 whitespace-nowrap">{new Date(l.measured_at).toLocaleString('he-IL')}</td>
                    <td className="p-2 font-semibold">{l.temperature}°C</td>
                    <td className="p-2">{l.method}</td>
                    <td className="p-2">{l.note || '-'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                    אין נתונים לטווח שנבחר
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">התראות פתוחות</h2>
          <div className="text-sm text-muted-foreground">{openAlerts.length} פתוחות</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-start font-medium">זמן</th>
                <th className="p-2 text-start font-medium">סוג</th>
                <th className="p-2 text-start font-medium">טמפ׳</th>
                <th className="p-2 text-start font-medium">פרטים</th>
                <th className="p-2 text-start font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {openAlerts.map((a) => (
                <tr key={a.id}>
                  <td className="p-2 whitespace-nowrap">{new Date(a.occurred_at).toLocaleString('he-IL')}</td>
                  <td className="p-2">{a.alert_type}</td>
                  <td className="p-2">{a.actual_temp ?? '-'}</td>
                  <td className="p-2">{a.details ?? '-'}</td>
                  <td className="p-2">
                    <Button variant="outline" size="sm" onClick={() => closeAlertMut.mutate(a.id)}>
                      סגירת התראה
                    </Button>
                  </td>
                </tr>
              ))}
              {openAlerts.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                    אין התראות פתוחות
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <Input placeholder="פעולה מתקנת (מה בוצע)" value={action} onChange={(e) => setAction(e.target.value)} className="flex-1 min-w-[250px]" />
          <Button onClick={() => addActionHandler(openAlerts[0]?.id)} disabled={!action}>
            תעד פעולה מתקנת
          </Button>
        </div>

        <div>
          <h3 className="font-medium mt-4 mb-2">היסטוריית פעולות מתקנות</h3>
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-start font-medium">זמן</th>
                  <th className="p-2 text-start font-medium">פעולה</th>
                  <th className="p-2 text-start font-medium">הערת אימות</th>
                  <th className="p-2 text-start font-medium">נסגר</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {actions.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2 whitespace-nowrap">{new Date(c.action_time).toLocaleString('he-IL')}</td>
                    <td className="p-2">{c.action_taken}</td>
                    <td className="p-2">{c.verification_note ?? '-'}</td>
                    <td className="p-2">{c.closed ? 'כן' : 'לא'}</td>
                  </tr>
                ))}
                {actions.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                      אין פעולות מתועדות
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
