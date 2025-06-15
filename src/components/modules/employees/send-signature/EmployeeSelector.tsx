
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee, ExistingSignature } from './types';

interface EmployeeSelectorProps {
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeIds: string[];
  existingSignatures: ExistingSignature[];
  signatureUrls?: { [employeeId: string]: string };
  onEmployeeToggle: (employeeId: string) => void;
  onEmployeeRemove: (employeeId: string) => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  employeesLoading,
  selectedEmployeeIds,
  existingSignatures,
  signatureUrls = {},
  onEmployeeToggle,
  onEmployeeRemove
}) => {
  const { toast } = useToast();

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

  const getEmployeeSignatureStatus = (employeeId: string) => {
    const signature = existingSignatures.find(sig => sig.employee_id === employeeId);
    if (!signature) return null;
    
    return {
      status: signature.status,
      signed_at: signature.signed_at,
      sent_at: signature.sent_at
    };
  };

  const getEmployeeName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}${employee.employee_id ? ` (${employee.employee_id})` : ''}`;
  };

  console.log('👥 EmployeeSelector rendered:', {
    employeesCount: employees.length,
    selectedCount: selectedEmployeeIds.length,
    signatureUrlsCount: Object.keys(signatureUrls).length,
    existingSignaturesCount: existingSignatures.length,
    signatureUrlsData: signatureUrls,
    firstEmployee: employees[0]?.id,
    hasSignatureForFirst: employees[0] ? !!signatureUrls[employees[0].id] : false
  });

  if (employeesLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <span>טוען עובדים...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4 text-gray-500">
            לא נמצאו עובדים פעילים
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">בחר עובדים לשליחה:</h3>
        
        {/* רשימת עובדים זמינים */}
        <div className="space-y-2 mb-4">
          {employees.map((employee) => {
            const isSelected = selectedEmployeeIds.includes(employee.id);
            const signatureStatus = getEmployeeSignatureStatus(employee.id);
            const hasSignatureUrl = signatureUrls[employee.id];
            const employeeName = getEmployeeName(employee);

            console.log(`👤 Employee ${employee.first_name}:`, {
              id: employee.id,
              isSelected,
              hasSignatureUrl: !!hasSignatureUrl,
              signatureUrl: hasSignatureUrl,
              signatureStatus
            });

            return (
              <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onEmployeeToggle(employee.id)}
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
                {hasSignatureUrl && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copySignatureUrl(signatureUrls[employee.id], employeeName)}
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
                      onClick={() => openSignatureUrl(signatureUrls[employee.id])}
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
          })}
        </div>

        {/* רשימת עובדים שנבחרו */}
        {selectedEmployeeIds.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">עובדים נבחרים ({selectedEmployeeIds.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {selectedEmployeeIds.map((employeeId) => {
                const employee = employees.find(emp => emp.id === employeeId);
                if (!employee) return null;
                
                const employeeName = getEmployeeName(employee);
                const hasSignatureUrl = signatureUrls[employeeId];

                return (
                  <div key={employeeId} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm text-blue-800">{employeeName}</span>
                    
                    {/* קישורי חתימה בתגיות */}
                    {hasSignatureUrl && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copySignatureUrl(signatureUrls[employeeId], employeeName)}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                          title="העתק קישור"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openSignatureUrl(signatureUrls[employeeId])}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                          title="פתח קישור"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEmployeeRemove(employeeId)}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-red-600"
                      title="הסר עובד"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
