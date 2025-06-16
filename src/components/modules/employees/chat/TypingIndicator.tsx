
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  users: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getUserNames = () => {
    if (users.length === 1) {
      return `${users[0].first_name} מקליד...`;
    }
    if (users.length === 2) {
      return `${users[0].first_name} ו${users[1].first_name} מקלידים...`;
    }
    return `${users.length} אנשים מקלידים...`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mx-4 mb-2">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600">{getUserNames()}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
