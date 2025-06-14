
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendToSignatureButtonProps {
  documentId: string;
  documentName: string;
  onSent?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const SendToSignatureButton: React.FC<SendToSignatureButtonProps> = ({
  documentId,
  documentName,
  onSent,
  variant = 'default',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // שליפת רשימת עובדים פעילים
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['active-employees-for-signature'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, email, phone')
        .eq('is_active', true)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const handleSendToSignature = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עובד לשליחה',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // עדכון מסמך עם פרטי העובד המיועד לחתימה
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          assignee_id: selectedEmployeeId,
          status: 'pending_signature',
          reminder_count: 0,
          reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // כאן ניתן להוסיף שליחת הודעה לעובד (SMS/Email)
      // const selectedEmployee = employees?.find(emp => emp.id === selectedEmployeeId);
      // await sendSignatureNotification(selectedEmployee, documentName);

      toast({
        title: 'הצלחה',
        description: `המסמך "${documentName}" נשלח לחתימה בהצלחה`,
      });

      setIsOpen(false);
      setSelectedEmployeeId('');
      onSent?.();
    } catch (error: any) {
      console.error('Error sending document for signature:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח את המסמך לחתימה',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          שלח לחתימה
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>שלח מסמך לחתימה</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              מסמך: <span className="font-medium">{documentName}</span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">בחר עובד לחתימה:</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עובד..." />
              </SelectTrigger>
              <SelectContent>
                {employeesLoading ? (
                  <SelectItem value="" disabled>טוען עובדים...</SelectItem>
                ) : (
                  employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                      {employee.employee_id && ` (${employee.employee_id})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSendToSignature}
              disabled={!selectedEmployeeId || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  שלח לחתימה
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
