
import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ReminderLogEntry {
  id: string;
  reminder_type: string;
  message: string;
  sent_at: string;
}

interface Props {
  docId: string;
  reminderLog: Record<string, ReminderLogEntry[]>;
  fetchReminders: (docId: string) => Promise<void>;
}

export const EmployeeDocumentReminders: React.FC<Props> = ({ docId, reminderLog, fetchReminders }) => (
  <div className="mt-2">
    <details
      className="w-full"
      onClick={async () => {
        if (!reminderLog[docId]) await fetchReminders(docId);
      }}
    >
      <summary className="cursor-pointer text-xs text-gray-600">
        {reminderLog[docId]?.length
          ? `היסטוריית תזכורות (${reminderLog[docId].length})`
          : 'הצג תזכורות שנשלחו'}
      </summary>
      <ul className="text-xs bg-gray-50 border rounded p-2 mt-1 space-y-1">
        {reminderLog[docId]?.length === 0 && (
          <li className="text-gray-400">לא נשלחו תזכורות למסמך זה</li>
        )}
        {reminderLog[docId]?.map(rem => (
          <li key={rem.id} className="flex flex-row gap-2 items-center">
            <span className="text-purple-700 font-bold">{rem.reminder_type}</span>
            <span>{rem.message}</span>
            <span className="ml-auto text-gray-500">
              {format(new Date(rem.sent_at), 'dd/MM/yyyy HH:mm', { locale: he })}
            </span>
          </li>
        ))}
      </ul>
    </details>
  </div>
);
