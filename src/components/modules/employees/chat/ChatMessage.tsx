
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { EmployeeChatMessage } from '@/types/employee-chat';

interface ChatMessageProps {
  message: EmployeeChatMessage;
  isOwnMessage: boolean;
  onUserClick?: (employeeId: string) => void;
  showAvatar?: boolean;
  isLastMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  onUserClick,
  showAvatar = true,
  isLastMessage = false,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: he,
    });
  };

  const handleUserClick = () => {
    if (onUserClick && message.employee?.id) {
      onUserClick(message.employee.id);
    }
  };

  const getMessageStatus = () => {
    if (!isOwnMessage) return null;
    
    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-gray-500" />;
  };

  return (
    <div className={`flex gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : ''} group`}>
      {/* Avatar - only show if not own message and showAvatar is true */}
      {!isOwnMessage && showAvatar && (
        <div
          className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
          onClick={handleUserClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {getInitials(message.employee?.first_name, message.employee?.last_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Spacer for own messages or when avatar is hidden */}
      {(isOwnMessage || !showAvatar) && !isOwnMessage && (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender Info - only for group messages */}
        {!isOwnMessage && message.message_type === 'group' && showAvatar && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span
              className="text-xs font-medium cursor-pointer hover:underline text-blue-600"
              onClick={handleUserClick}
            >
              {message.employee?.first_name} {message.employee?.last_name}
            </span>
            {message.message_type === 'group' && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                קבוצה
              </Badge>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl px-3 py-2 max-w-full break-words ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          } shadow-sm`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.message_content}
          </p>
          
          {/* Message time and status */}
          <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.created_at)}
            </span>
            {getMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};
