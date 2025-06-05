
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      const { error } = await supabase
        .from('employee_requests')
        .insert({
          employee_id: employeeId,
          request_type: requestType as 'vacation' | 'sick_leave' | 'shift_change' | 'equipment' | 'other',
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
    return <div dir="rtl">טוען...</div>;
  }

  if (!employeeId) {
    return (
      <Card dir="rtl">
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">אנא בחר עובד כדי לשלוח בקשה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          בקשת עובד
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">סוג בקשה *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג בקשה" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">נושא *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="נושא הבקשה"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">פרטים נוספים</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרט את הבקשה..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={submitting} 
            className="w-full flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'שולח...' : 'שלח בקשה'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
