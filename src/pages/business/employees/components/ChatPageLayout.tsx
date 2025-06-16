
import React from 'react';
import { EmployeeChatSidebar } from '@/components/modules/employees/chat/EmployeeChatSidebar';
import { ChatAreaContainer } from '@/components/modules/employees/chat/ChatAreaContainer';
import type { Employee } from '@/types/employee';
import type { EmployeeChatMessage } from '@/types/employee-chat';

interface ChatPageLayoutProps {
  employees: Employee[];
  selectedEmployee: Employee | undefined;
  selectedGroup: any;
  selectedEmployeeId: string | null;
  selectedGroupId: string | null;
  onEmployeeSelect: (employeeId: string) => void;
  onGroupSelect: (groupId: string) => void;
  messages: EmployeeChatMessage[];
  isLoadingMessages: boolean;
  messagesError: any;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  currentUserId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({
  employees,
  selectedEmployee,
  selectedGroup,
  selectedEmployeeId,
  selectedGroupId,
  onEmployeeSelect,
  onGroupSelect,
  messages,
  isLoadingMessages,
  messagesError,
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
  isSending,
  currentUserId,
  messagesEndRef,
}) => {
  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-sm border" dir="rtl">
      {/* Sidebar */}
      <EmployeeChatSidebar
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        selectedGroupId={selectedGroupId}
        onEmployeeSelect={onEmployeeSelect}
        onGroupSelect={onGroupSelect}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatAreaContainer
          selectedEmployee={selectedEmployee}
          selectedGroup={selectedGroup}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          messagesError={messagesError}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
          isSending={isSending}
          currentUserId={currentUserId}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
};
