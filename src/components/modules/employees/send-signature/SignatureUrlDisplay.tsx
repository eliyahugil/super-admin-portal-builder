
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface SignatureUrlDisplayProps {
  signatureUrls: { [employeeId: string]: string };
  employees: Employee[];
  onClose: () => void;
}

export const SignatureUrlDisplay: React.FC<SignatureUrlDisplayProps> = ({
  signatureUrls,
  employees,
  onClose
}) => {
  const { toast } = useToast();

  const copyToClipboard = (url: string, employeeName: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'הועתק ללוח',
      description: `קישור החתימה של ${employeeName} הועתק ללוח`,
    });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return `עובד ${employeeId}`;
    return `${employee.first_name} ${employee.last_name}${employee.employee_id ? ` (${employee.employee_id})` : ''}`;
  };

  console.log('🔗 SignatureUrlDisplay rendered:', {
    urlsCount: Object.keys(signatureUrls).length,
    employeesCount: employees.length
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">קישורי חתימה נוצרו בהצלחה</h3>
        <p className="text-sm text-gray-600 mb-4">
          שלח את הקישורים הבאים לעובדים לחתימה דיגיטלית:
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(signatureUrls).map(([employeeId, url]) => (
          <div key={employeeId} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">
                {getEmployeeName(employeeId)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 text-xs p-2 border rounded bg-white"
                dir="ltr"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(url, getEmployeeName(employeeId))}
                title="העתק קישור"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(url)}
                title="פתח בכרטיסייה חדשה"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          סגור
        </Button>
      </div>
    </div>
  );
};
