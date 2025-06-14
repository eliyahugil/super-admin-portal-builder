
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, RotateCcw, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendToSignatureButtonProps {
  documentId: string;
  documentName: string;
  onSent?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  isAlreadyAssigned?: boolean;
}

export const SendToSignatureButton: React.FC<SendToSignatureButtonProps> = ({
  documentId,
  documentName,
  onSent,
  variant = 'default',
  size = 'sm',
  isAlreadyAssigned = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState('');
  const { toast } = useToast();

  console.log('🔍 SendToSignatureButton rendered for document:', documentName, 'ID:', documentId, 'Already assigned:', isAlreadyAssigned);

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
    console.log('📤 Sending document to signature:', { documentId, selectedEmployeeId, isResend: isAlreadyAssigned });
    
    try {
      // יצירת טוקן ייחודי לחתימה דיגיטלית
      const signatureToken = crypto.randomUUID();
      
      // עדכון מסמך עם פרטי העובד המיועד לחתימה
      const updateData: any = {
        assignee_id: selectedEmployeeId,
        status: 'pending_signature',
        reminder_count: 0,
        reminder_sent_at: new Date().toISOString(),
        digital_signature_token: signatureToken,
      };

      // אם זה שליחה מחדש, נאפס את תאריך החתימה
      if (isAlreadyAssigned) {
        updateData.signed_at = null;
        updateData.digital_signature_data = null;
      }

      const { error: updateError } = await supabase
        .from('employee_documents')
        .update(updateData)
        .eq('id', documentId);

      if (updateError) throw updateError;

      // יצירת קישור חתימה דיגיטלית
      const baseUrl = window.location.origin;
      const signUrl = `${baseUrl}/sign-document/${documentId}?token=${signatureToken}`;
      setSignatureUrl(signUrl);

      // כאן ניתן להוסיף שליחת הודעה לעובד (SMS/Email) עם הקישור
      // const selectedEmployee = employees?.find(emp => emp.id === selectedEmployeeId);
      // await sendSignatureNotification(selectedEmployee, documentName, signUrl);

      const actionText = isAlreadyAssigned ? 'נשלח מחדש' : 'נשלח';
      toast({
        title: 'הצלחה',
        description: `המסמך "${documentName}" ${actionText} לחתימה בהצלחה`,
      });

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

  const copySignatureUrl = () => {
    navigator.clipboard.writeText(signatureUrl);
    toast({
      title: 'הועתק!',
      description: 'קישור החתימה הועתק ללוח',
    });
  };

  const buttonText = isAlreadyAssigned ? 'שלח מחדש' : 'שלח לחתימה';
  const buttonIcon = isAlreadyAssigned ? RotateCcw : Send;
  const IconComponent = buttonIcon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setSignatureUrl('');
        setSelectedEmployeeId('');
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="flex items-center gap-2"
          onClick={() => console.log('📌 SendToSignature button clicked for:', documentName)}
        >
          <IconComponent className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isAlreadyAssigned ? 'שלח מסמך מחדש לחתימה' : 'שלח מסמך לחתימה'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!signatureUrl ? (
            <>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  מסמך: <span className="font-medium">{documentName}</span>
                </p>
                {isAlreadyAssigned && (
                  <p className="text-sm text-amber-600 mb-2">
                    המסמך כבר נשלח לחתימה. שליחה מחדש תאפס את סטטוס החתימה.
                  </p>
                )}
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
                      <IconComponent className="h-4 w-4 ml-2" />
                      {buttonText}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">קישור חתימה נוצר בהצלחה!</h3>
                <p className="text-sm text-green-700 mb-3">
                  שלח את הקישור הבא לעובד לחתימה על המסמך:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white border rounded text-sm font-mono break-all">
                  {signatureUrl}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copySignatureUrl}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setIsOpen(false)}>
                  סגור
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
