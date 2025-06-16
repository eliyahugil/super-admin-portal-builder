
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeChatMessages } from '@/hooks/useEmployeeChatMessages';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';
import { EmployeeChatSidebar } from '@/components/modules/employees/chat/EmployeeChatSidebar';
import { ChatAreaContainer } from '@/components/modules/employees/chat/ChatAreaContainer';
import { EmptyChatState } from '@/components/modules/employees/chat/EmptyChatState';

const EmployeeChatPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useEmployeesData();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 EmployeeChatPage - Profile:', profile?.id, profile?.role);
  console.log('💬 EmployeeChatPage - Employees loaded:', employees.length);
  console.log('💬 EmployeeChatPage - Selected employee:', selectedEmployeeId);
  console.log('💬 EmployeeChatPage - Selected group:', selectedGroupId);

  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
    isSending,
  } = useEmployeeChatMessages(selectedEmployeeId, selectedGroupId);

  const { groups } = useEmployeeChatGroups();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && (selectedEmployeeId || selectedGroupId)) {
      console.log('📤 Sending message:', newMessage);
      sendMessage({
        employeeId: selectedEmployeeId || undefined,
        groupId: selectedGroupId || undefined,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedGroupId(null); // Clear group selection
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedEmployeeId(null); // Clear employee selection
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedGroup = groups.find(group => group.id === selectedGroupId);

  console.log('💬 EmployeeChatPage - Rendering with employees:', employees.length, 'loading:', isLoadingEmployees);

  if (isLoadingEmployees) {
    return (
      <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען עובדים...</p>
        </div>
      </div>
    );
  }

  if (employeesError) {
    console.error('💬 EmployeeChatPage - Employees error:', employeesError);
    return (
      <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex items-center justify-center" dir="rtl">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">שגיאה בטעינת העובדים</span>
          </div>
          <p className="text-gray-600">לא ניתן לטעון את רשימת העובדים. אנא נסה שוב מאוחר יותר.</p>
          <p className="text-sm text-gray-500 mt-2">שגיאה: {employeesError.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex gap-4" dir="rtl">
      {/* Chat Sidebar */}
      <EmployeeChatSidebar
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        selectedGroupId={selectedGroupId}
        onEmployeeSelect={handleEmployeeSelect}
        onGroupSelect={handleGroupSelect}
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
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isSending={isSending}
            currentUserId={profile?.id}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <EmptyChatState employees={employees} />
        )}
      </div>
    </div>
  );
};

export default EmployeeChatPage;
