
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { UserProfileDialog } from './UserProfileDialog';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import type { EmployeeChatMessage } from '@/types/employee-chat';

interface ChatMessagesAreaProps {
  messages: EmployeeChatMessage[];
  currentUserId?: string;
  isLoading: boolean;
  error?: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  currentUserId,
  isLoading,
  error,
  messagesEndRef,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const { data: employees = [] } = useEmployeesData();

  const handleUserClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowUserProfile(true);
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">טוען הודעות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">שגיאה בטעינת ההודעות</p>
          <p className="text-sm">אנא נסה שוב מאוחר יותר</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">אין עדיין הודעות</p>
                <p className="text-sm">התחל שיחה חדשה!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
                onUserClick={handleUserClick}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        employee={selectedEmployee || null}
      />
    </>
  );
};
