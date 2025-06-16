
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import type { EmployeeChatMessage } from '@/types/employee-chat';

interface ChatMessageProps {
  message: EmployeeChatMessage;
  isOwnMessage: boolean;
  onUserClick?: (employeeId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  onUserClick,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: he,
    });
  };

  const handleUserClick = () => {
    if (onUserClick && message.employee?.id) {
      onUserClick(message.employee.id);
    }
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} mb-4`}>
      {/* Avatar */}
      <div
        className="cursor-pointer hover:scale-105 transition-transform"
        onClick={handleUserClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(message.employee?.first_name, message.employee?.last_name)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Sender Info */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-medium cursor-pointer hover:underline"
            onClick={handleUserClick}
          >
            {message.employee?.first_name} {message.employee?.last_name}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
          {message.message_type === 'group' && (
            <Badge variant="outline" className="text-xs">
              קבוצה
            </Badge>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message_content}
          </p>
        </div>

        {/* Read Status */}
        {isOwnMessage && (
          <div className="text-xs text-gray-500 mt-1">
            {message.is_read ? '✓✓ נקרא' : '✓ נשלח'}
          </div>
        )}
      </div>
    </div>
  );
};
