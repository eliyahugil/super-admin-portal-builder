
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Send } from 'lucide-react';
import { EmployeeSelector } from './EmployeeSelector';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface ExistingSignature {
  employee_id: string;
  status: string;
  employee?: Employee;
}

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
  onSend: (isResending?: boolean) => void;
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
  console.log('📋 SignatureForm rendered:', {
    documentName,
    hasExistingSignatures,
    employeesCount: employees.length,
    selectedEmployeeIds,
    isSending
  });

  const hasSelectedEmployees = selectedEmployeeIds.length > 0;
  const buttonText = hasExistingSignatures ? 'שלח מחדש' : 'שלח לחתימה';
  const ButtonIcon = hasExistingSignatures ? RotateCcw : Send;

  const handleSend = () => {
    onSend(hasExistingSignatures);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">
          מסמך: <span className="font-medium">{documentName}</span>
        </p>
        {hasExistingSignatures && (
          <p className="text-sm text-amber-600 mb-2">
            למסמך זה כבר קיימות חתימות. שליחה מחדש תאפס את סטטוס החתימות הקיימות.
          </p>
        )}
        {existingSignatures.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            חתימות קיימות: {existingSignatures.filter(s => s.status === 'signed').length} נחתמו, {' '}
            {existingSignatures.filter(s => s.status === 'pending').length} ממתינות
          </div>
        )}
      </div>
      
      <EmployeeSelector
        employees={employees}
        employeesLoading={employeesLoading}
        selectedEmployeeIds={selectedEmployeeIds}
        existingSignatures={existingSignatures}
        onEmployeeToggle={onEmployeeToggle}
        onEmployeeRemove={onEmployeeRemove}
      />
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSending}
        >
          ביטול
        </Button>
        <Button
          onClick={handleSend}
          disabled={!hasSelectedEmployees || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            <>
              <ButtonIcon className="h-4 w-4 ml-2" />
              {buttonText} ({selectedEmployeeIds.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
