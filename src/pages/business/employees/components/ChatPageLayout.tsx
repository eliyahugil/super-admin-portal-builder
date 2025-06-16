
import React from 'react';
import { EmployeeChatSidebar } from '@/components/modules/employees/chat/EmployeeChatSidebar';
import { ChatAreaContainer } from '@/components/modules/employees/chat/ChatAreaContainer';
import { EmptyChatState } from '@/components/modules/employees/chat/EmptyChatState';
import type { Employee } from '@/types/employee';
import type { EmployeeChatMessage, EmployeeChatGroup } from '@/types/employee-chat';

interface ChatPageLayoutProps {
  employees: Employee[];
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
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
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex gap-4" dir="rtl">
      {/* Chat Sidebar */}
      <EmployeeChatSidebar
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        selectedGroupId={selectedGroupId}
        onEmployeeSelect={onEmployeeSelect}
        onGroupSelect={onGroupSelect}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedEmployee || selectedGroup ? (
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
        ) : (
          <EmptyChatState employees={employees} />
        )}
      </div>
    </div>
  );
};
