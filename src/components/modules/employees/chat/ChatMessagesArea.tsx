
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Employee } from '@/types/employee';
import type { EmployeeChatMessage, EmployeeChatGroup } from '@/types/employee-chat';

interface ChatMessagesAreaProps {
  messages: EmployeeChatMessage[];
  isLoading: boolean;
  error: any;
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
  currentUserId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  isLoading,
  error,
  selectedEmployee,
  selectedGroup,
  currentUserId,
  messagesEndRef,
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">טוען הודעות...</div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            שגיאה בטעינת ההודעות
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 text-center">
            <MessageCircle className="h-6 w-6 mx-auto mb-2" />
            {selectedGroup ? (
              <>
                עדיין אין הודעות בקבוצה זו
                <br />
                שלח הודעה ראשונה להתחיל את השיחה
              </>
            ) : (
              <>
                עדיין אין הודעות עם העובד הזה
                <br />
                שלח הודעה ראשונה כדי להתחיל את השיחה
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message: EmployeeChatMessage) => {
          const isFromCurrentUser = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isFromCurrentUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!isFromCurrentUser && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {selectedGroup && message.employee ? 
                          getInitials(`${message.employee.first_name} ${message.employee.last_name}`) :
                          selectedEmployee ? 
                            getInitials(`${selectedEmployee.first_name} ${selectedEmployee.last_name}`) :
                            '?'
                        }
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    {/* Show sender name in group chats */}
                    {selectedGroup && !isFromCurrentUser && message.employee && (
                      <p className="text-xs font-medium mb-1 opacity-75">
                        {message.employee.first_name} {message.employee.last_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message_content}
                    </p>
                    <span className={`text-xs mt-1 block ${
                      isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {format(new Date(message.created_at), 'dd/MM HH:mm', { locale: he })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
