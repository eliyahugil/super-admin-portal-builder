
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatHeader } from './ChatHeader';
import { ChatMessagesArea } from './ChatMessagesArea';
import { ChatMessageInput } from './ChatMessageInput';
import type { Employee } from '@/types/employee';
import type { EmployeeChatMessage, EmployeeChatGroup } from '@/types/employee-chat';

interface ChatAreaContainerProps {
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
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

export const ChatAreaContainer: React.FC<ChatAreaContainerProps> = ({
  selectedEmployee,
  selectedGroup,
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
    <Card className="flex-1 flex flex-col">
      <ChatHeader 
        selectedEmployee={selectedEmployee}
        selectedGroup={selectedGroup}
      />
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ChatMessagesArea
          messages={messages}
          isLoading={isLoadingMessages}
          error={messagesError}
          selectedEmployee={selectedEmployee}
          selectedGroup={selectedGroup}
          currentUserId={currentUserId}
          messagesEndRef={messagesEndRef}
        />
        
        <ChatMessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
          selectedEmployee={selectedEmployee}
          selectedGroup={selectedGroup}
          isSending={isSending}
        />
      </CardContent>
    </Card>
  );
};
