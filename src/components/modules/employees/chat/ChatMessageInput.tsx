
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import type { Employee } from '@/types/employee';
import type { EmployeeChatGroup } from '@/types/employee-chat';

interface ChatMessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  selectedEmployee?: Employee;
  selectedGroup?: EmployeeChatGroup;
  isSending: boolean;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
  selectedEmployee,
  selectedGroup,
  isSending,
}) => {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={
            selectedGroup 
              ? `כתוב הודעה לקבוצת ${selectedGroup.name}...`
              : selectedEmployee
              ? `כתוב הודעה ל${selectedEmployee.first_name}...`
              : 'כתוב הודעה...'
          }
          className="flex-1"
          disabled={isSending}
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!newMessage.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
