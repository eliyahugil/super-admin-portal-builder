
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

interface SignatureFormProps {
  documentName: string;
  isAlreadyAssigned: boolean;
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeId: string;
  isSending: boolean;
  onEmployeeSelect: (employeeId: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export const SignatureForm: React.FC<SignatureFormProps> = ({
  documentName,
  isAlreadyAssigned,
  employees,
  employeesLoading,
  selectedEmployeeId,
  isSending,
  onEmployeeSelect,
  onSend,
  onCancel
}) => {
  const buttonText = isAlreadyAssigned ? 'שלח מחדש' : 'שלח לחתימה';
  const ButtonIcon = isAlreadyAssigned ? RotateCcw : Send;

  return (
    <div className="space-y-4">
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
      
      <EmployeeSelector
        employees={employees}
        employeesLoading={employeesLoading}
        selectedEmployeeId={selectedEmployeeId}
        onSelectionChange={onEmployeeSelect}
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
          onClick={onSend}
          disabled={!selectedEmployeeId || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            <>
              <ButtonIcon className="h-4 w-4 ml-2" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
