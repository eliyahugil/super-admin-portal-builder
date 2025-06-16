
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { UserProfileDialog } from './UserProfileDialog';
import { TypingIndicator } from './TypingIndicator';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import type { EmployeeChatMessage, EmployeeChatGroup } from '@/types/employee-chat';
import type { Employee } from '@/types/employee';

interface ChatMessagesAreaProps {
  messages: EmployeeChatMessage[];
  currentUserId?: string;
  isLoading: boolean;
  error?: any;
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onStartPrivateChat?: (employeeId: string) => void;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  currentUserId,
  isLoading,
  error,
  selectedEmployee,
  selectedGroup,
  messagesEndRef,
  onStartPrivateChat,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const { data: employees = [] } = useEmployeesData();

  const handleUserClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setShowUserProfile(true);
  };

  const profileEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  // Group messages by date for better organization
  const groupMessagesByDate = (messages: EmployeeChatMessage[]) => {
    const groups: { [date: string]: EmployeeChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'אתמול';
    } else {
      return date.toLocaleDateString('he-IL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Check if we should show avatar for this message
  const shouldShowAvatar = (message: EmployeeChatMessage, index: number, dayMessages: EmployeeChatMessage[]) => {
    if (message.sender_id === currentUserId) return false; // Never show avatar for own messages
    if (selectedEmployee) return index === 0 || dayMessages[index - 1]?.sender_id !== message.sender_id; // Show if first message or different sender
    return true; // Always show in group chats
  };

  // Mock typing users - in real app this would come from WebSocket/real-time updates
  const typingUsers: Array<{ id: string; first_name: string; last_name: string }> = [];

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

  const messagesByDate = groupMessagesByDate(messages);

  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {Object.keys(messagesByDate).length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">אין עדיין הודעות</p>
                <p className="text-sm">התחל שיחה חדשה!</p>
              </div>
            </div>
          ) : (
            Object.entries(messagesByDate).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateSeparator(date)}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dayMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.sender_id === currentUserId}
                    onUserClick={handleUserClick}
                    showAvatar={shouldShowAvatar(message, index, dayMessages)}
                    isLastMessage={index === dayMessages.length - 1}
                  />
                ))}
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          <TypingIndicator users={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        employee={profileEmployee || null}
        onStartChat={onStartPrivateChat}
      />
    </>
  );
};
