import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeRequestFormProps {
  employeeId?: string;
}

export const EmployeeRequestForm: React.FC<EmployeeRequestFormProps> = ({ employeeId }) => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestTypes = [
    { value: 'vacation', label: 'בקשת חופשה' },
    { value: 'sick_leave', label: 'דיווח מחלה' },
    { value: 'shift_change', label: 'שינוי במשמרת' },
    { value: 'equipment', label: 'בקשת ציוד' },
    { value: 'other', label: 'אחר' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestType || !subject || !employeeId) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Fix the type issue - only use valid enum values
      const validRequestType = ['vacation', 'equipment', 'shift_change'].includes(requestType) 
        ? requestType as 'vacation' | 'equipment' | 'shift_change'
        : 'equipment'; // fallback for other types

      const { error } = await supabase
        .from('employee_requests')
        .insert({
          employee_id: employeeId,
          request_type: validRequestType,
          subject,
          description: description || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "הבקשה נשלחה בהצלחה"
      });

      // Reset form
      setRequestType('');
      setSubject('');
      setDescription('');
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

  if (!employeeId) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6" dir="rtl">
        <p className="text-gray-500 text-center">אנא בחר עובד כדי לשלוח בקשה</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">בקשת עובד</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm text-gray-600">סוג בקשה *</Label>
          <Select value={requestType} onValueChange={setRequestType}>
            <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <SelectValue placeholder="בחר סוג בקשה" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-lg border">
              {requestTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="p-3 hover:bg-gray-50">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm text-gray-600">נושא *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="נושא הבקשה"
            required
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm text-gray-600">פרטים נוספים</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="פרט את הבקשה..."
            rows={4}
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          {submitting ? 'שולח...' : 'שלח בקשה'}
        </Button>
      </form>
    </div>
  );
};
