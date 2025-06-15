
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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
  if (!hasSignatures || isTemplate) {
    return null;
  }

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
                    {sig.employee?.first_name} {sig.employee?.last_name}
                    {sig.employee?.employee_id && ` (${sig.employee.employee_id})`}
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
                  <span>
                    {sig.employee?.first_name} {sig.employee?.last_name}
                    {sig.employee?.employee_id && ` (${sig.employee.employee_id})`}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    ממתין
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
