
import React, { useState } from 'react';

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
}

interface AssignToEmployeeSelectProps {
  docId: string;
  employees: EmployeeOption[];
  assigningId: string | null;
  uploading: boolean;
  onAssign: (docId: string, assignId: string) => void;
}

export const AssignToEmployeeSelect: React.FC<AssignToEmployeeSelectProps> = ({
  docId,
  employees,
  assigningId,
  uploading,
  onAssign,
}) => {
  const [tempId, setTempId] = useState('');
  return (
    <div className="flex gap-2 items-center">
      <select
        value={tempId}
        className="px-2 py-1 rounded border text-sm"
        onChange={e => setTempId(e.target.value)}
        disabled={assigningId === docId || uploading}
      >
        <option value="">בחר עובד</option>
        {employees?.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.first_name} {emp.last_name} ({emp.employee_id || ''})
          </option>
        ))}
      </select>
      <button
        disabled={!tempId || assigningId === docId}
        className="bg-blue-500 hover:bg-blue-700 text-xs text-white px-3 py-1 rounded disabled:bg-blue-200"
        onClick={() => onAssign(docId, tempId)}
        type="button"
      >
        {assigningId === docId ? 'שולח...' : 'שלח לחתימה'}
      </button>
    </div>
  );
};
