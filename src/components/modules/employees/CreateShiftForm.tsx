
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useRealData } from '@/hooks/useRealData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CreateShiftForm: React.FC = () => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: employees } = useRealData<any>({
    queryKey: ['employees-for-shift', businessId],
    tableName: 'employees',
    select: 'id, first_name, last_name, employee_id',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const { data: shiftTemplates } = useRealData<any>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    select: 'id, name, start_time, end_time, shift_type',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplateId || !shiftDate) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const shiftData: any = {
        shift_template_id: selectedTemplateId,
        shift_date: shiftDate,
        is_assigned: !!selectedEmployeeId,
        notes: notes || null
      };

      if (selectedEmployeeId) {
        shiftData.employee_id = selectedEmployeeId;
      }

      const { error } = await supabase
        .from('scheduled_shifts')
        .insert([shiftData]);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המשמרת נוצרה בהצלחה"
      });

      // Reset form
      setSelectedEmployeeId('');
      setSelectedTemplateId('');
      setShiftDate('');
      setNotes('');
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div dir="rtl" className="flex items-center justify-center p-6">טוען...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">יצירת משמרת חדשה</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template" className="text-sm text-gray-600">תבנית משמרת *</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <SelectValue placeholder="בחר תבנית משמרת" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-lg border">
              {shiftTemplates?.map((template) => (
                <SelectItem key={template.id} value={template.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {template.name} ({template.start_time} - {template.end_time})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm text-gray-600">תאריך *</Label>
          <Input
            id="date"
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            required
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee" className="text-sm text-gray-600">עובד (אופציונלי)</Label>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <SelectValue placeholder="בחר עובד (ניתן להשאיר ריק)" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-lg border">
              {employees?.map((employee) => (
                <SelectItem key={employee.id} value={employee.id} className="p-3 hover:bg-gray-50">
                  {employee.first_name} {employee.last_name}
                  {employee.employee_id && ` (${employee.employee_id})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm text-gray-600">הערות</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות נוספות למשמרת"
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {submitting ? 'יוצר...' : 'צור משמרת'}
        </Button>
      </form>
    </div>
  );
};
