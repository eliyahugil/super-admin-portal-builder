
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee, ExistingSignature } from './types';

interface EmployeeListItemProps {
  employee: Employee;
  isSelected: boolean;
  signatureUrl?: string;
  signatureStatus?: {
    status: string;
    signed_at?: string | null;
    sent_at: string;
  } | null;
  onToggle: (employeeId: string) => void;
}

export const EmployeeListItem: React.FC<EmployeeListItemProps> = ({
  employee,
  isSelected,
  signatureUrl,
  signatureStatus,
  onToggle
}) => {
  const { toast } = useToast();

  const getEmployeeName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}${employee.employee_id ? ` (${employee.employee_id})` : ''}`;
  };

  const copySignatureUrl = (url: string, employeeName: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'הועתק ללוח',
      description: `קישור החתימה של ${employeeName} הועתק ללוח`,
    });
  };

  const openSignatureUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const employeeName = getEmployeeName(employee);

  console.log(`👤 Employee ${employee.first_name}:`, {
    id: employee.id,
    isSelected,
    hasSignatureUrl: !!signatureUrl,
    signatureUrl,
    signatureStatus
  });

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(employee.id)}
        />
        
        <div className="flex-1">
          <span className="font-medium">{employeeName}</span>
          
          {/* סטטוס חתימה קיימת */}
          {signatureStatus && (
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={signatureStatus.status === 'signed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {signatureStatus.status === 'signed' ? 'נחתם' : 'נשלח'}
              </Badge>
              {signatureStatus.status === 'signed' && signatureStatus.signed_at && (
                <span className="text-xs text-gray-500">
                  נחתם: {new Date(signatureStatus.signed_at).toLocaleDateString('he-IL')}
                </span>
              )}
              {signatureStatus.status === 'pending' && signatureStatus.sent_at && (
                <span className="text-xs text-gray-500">
                  נשלח: {new Date(signatureStatus.sent_at).toLocaleDateString('he-IL')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* קישור חתימה אם קיים */}
      {signatureUrl && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copySignatureUrl(signatureUrl, employeeName)}
            className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
            title="העתק קישור חתימה"
          >
            <Copy className="h-4 w-4" />
            העתק
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openSignatureUrl(signatureUrl)}
            className="flex items-center gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
            title="פתח קישור חתימה"
          >
            <ExternalLink className="h-4 w-4" />
            פתח
          </Button>
        </div>
      )}
    </div>
  );
};
