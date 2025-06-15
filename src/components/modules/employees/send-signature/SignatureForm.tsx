
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeSelector } from './EmployeeSelector';
import { useToast } from '@/hooks/use-toast';
import type { Employee, ExistingSignature } from './types';

interface SignatureFormProps {
  documentName: string;
  hasExistingSignatures: boolean;
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeIds: string[];
  existingSignatures: ExistingSignature[];
  isSending: boolean;
  onEmployeeToggle: (employeeId: string) => void;
  onEmployeeRemove: (employeeId: string) => void;
  onSend: (isResending: boolean) => void;
  onCancel: () => void;
}

export const SignatureForm: React.FC<SignatureFormProps> = ({
  documentName,
  hasExistingSignatures,
  employees,
  employeesLoading,
  selectedEmployeeIds,
  existingSignatures,
  isSending,
  onEmployeeToggle,
  onEmployeeRemove,
  onSend,
  onCancel
}) => {
  const { toast } = useToast();

  const copyDocumentName = () => {
    navigator.clipboard.writeText(documentName);
    toast({
      title: 'הועתק ללוח',
      description: `שם המסמך "${documentName}" הועתק ללוח`,
    });
  };

  const openDocumentLink = () => {
    // יצירת קישור למסמך - זה יכול להיות קישור לצפייה במסמך
    toast({
      title: 'קישור המסמך',
      description: 'פותח את המסמך...',
    });
  };

  const canSend = selectedEmployeeIds.length > 0;
  const isResending = hasExistingSignatures;

  console.log('📝 SignatureForm rendered:', {
    documentName,
    hasExistingSignatures,
    selectedCount: selectedEmployeeIds.length,
    employeesCount: employees.length,
    existingSignaturesCount: existingSignatures.length,
    canSend,
    isResending
  });

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin ml-2" />
        <span>טוען עובדים...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* כרטיס מידע על המסמך */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">מסמך לשליחה:</h3>
              <p className="text-blue-700 text-sm">{documentName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyDocumentName}
                className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
                title="העתק שם מסמך"
              >
                <Copy className="h-4 w-4" />
                העתק
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openDocumentLink}
                className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
                title="פתח קישור למסמך"
              >
                <ExternalLink className="h-4 w-4" />
                קישור
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* בחירת עובדים */}
      <EmployeeSelector
        employees={employees}
        employeesLoading={employeesLoading}
        selectedEmployeeIds={selectedEmployeeIds}
        existingSignatures={existingSignatures}
        onEmployeeToggle={onEmployeeToggle}
        onEmployeeRemove={onEmployeeRemove}
      />

      {/* כפתורי פעולה */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSending}
        >
          ביטול
        </Button>
        <Button
          type="button"
          onClick={() => onSend(isResending)}
          disabled={!canSend || isSending}
          className="flex items-center gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              שולח...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isResending ? 'שלח מחדש' : 'שלח לחתימה'}
            </>
          )}
        </Button>
      </div>

      {/* הודעה אם לא נבחרו עובדים */}
      {selectedEmployeeIds.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          בחר לפחות עובד אחד כדי לשלוח את המסמך לחתימה
        </div>
      )}
    </div>
  );
};
