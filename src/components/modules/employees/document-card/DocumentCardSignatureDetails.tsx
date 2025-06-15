
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface DocumentCardSignatureDetailsProps {
  hasSignatures: boolean;
  isTemplate: boolean;
  document: any;
  completedSignatures: any[];
  pendingSignatures: any[];
}

export const DocumentCardSignatureDetails: React.FC<DocumentCardSignatureDetailsProps> = ({
  hasSignatures,
  isTemplate,
  document,
  completedSignatures,
  pendingSignatures
}) => {
  const { toast } = useToast();

  if (!hasSignatures || isTemplate) {
    return null;
  }

  const copySignatureUrl = (signatureId: string, employeeName: string) => {
    // יצירת קישור חתימה
    const signatureUrl = `${window.location.origin}/sign-document/${signatureId}`;
    navigator.clipboard.writeText(signatureUrl);
    toast({
      title: 'הועתק ללוח',
      description: `קישור החתימה של ${employeeName} הועתק ללוח`,
    });
  };

  const openSignatureUrl = (signatureId: string) => {
    const signatureUrl = `${window.location.origin}/sign-document/${signatureId}`;
    window.open(signatureUrl, '_blank');
  };

  const getEmployeeName = (signature: any) => {
    if (!signature.employee) return 'עובד לא זמין';
    const { first_name, last_name, employee_id } = signature.employee;
    return `${first_name} ${last_name}${employee_id ? ` (${employee_id})` : ''}`;
  };

  return (
    <div className="w-full mt-2">
      <details className="text-sm">
        <summary className="cursor-pointer text-blue-700 hover:text-blue-800">
          רשימת חתימות ({document.signatures.length})
        </summary>
        <div className="mt-2 space-y-1 bg-gray-50 rounded p-2">
          {/* חתימות שהושלמו */}
          {completedSignatures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-700 mb-1">
                ✅ חתמו ({completedSignatures.length}):
              </div>
              {completedSignatures.map((sig: any) => (
                <div key={sig.id} className="flex items-center justify-between text-xs bg-green-50 rounded px-2 py-1">
                  <span>
                    {getEmployeeName(sig)}
                  </span>
                  <span className="text-green-600 text-xs">
                    {sig.signed_at && format(new Date(sig.signed_at), 'dd/MM HH:mm', { locale: he })}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* חתימות ממתינות */}
          {pendingSignatures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-orange-700 mb-1">
                ⏳ ממתינים ({pendingSignatures.length}):
              </div>
              {pendingSignatures.map((sig: any) => (
                <div key={sig.id} className="flex items-center justify-between text-xs bg-orange-50 rounded px-2 py-1">
                  <div className="flex items-center gap-2 flex-1">
                    <span>
                      {getEmployeeName(sig)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      ממתין
                    </Badge>
                  </div>
                  
                  {/* כפתורי העתקה ופתיחה של קישור החתימה */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copySignatureUrl(sig.id, getEmployeeName(sig))}
                      className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                      title="העתק קישור חתימה"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openSignatureUrl(sig.id)}
                      className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                      title="פתח קישור חתימה"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
