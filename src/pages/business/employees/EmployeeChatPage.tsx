
import React from 'react';
import { useChatPage } from './hooks/useChatPage';
import { ChatPageLoading } from './components/ChatPageLoading';
import { ChatPageError } from './components/ChatPageError';
import { ChatPageLayout } from './components/ChatPageLayout';

const EmployeeChatPage: React.FC = () => {
  const {
    employees,
    selectedEmployee,
    selectedGroup,
    selectedEmployeeId,
    selectedGroupId,
    messages,
    profile,
    messagesEndRef,
    isLoadingEmployees,
    isLoadingMessages,
    isSending,
    employeesError,
    messagesError,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyPress,
    handleEmployeeSelect,
    handleGroupSelect,
  } = useChatPage();

  console.log('💬 EmployeeChatPage - Rendering with employees:', employees.length, 'loading:', isLoadingEmployees);

  if (isLoadingEmployees) {
    return <ChatPageLoading />;
  }

  if (employeesError) {
    console.error('💬 EmployeeChatPage - Employees error:', employeesError);
    return <ChatPageError error={employeesError} />;
  }

  return (
    <ChatPageLayout
      employees={employees}
      selectedEmployee={selectedEmployee}
      selectedGroup={selectedGroup}
      selectedEmployeeId={selectedEmployeeId}
      selectedGroupId={selectedGroupId}
      onEmployeeSelect={handleEmployeeSelect}
      onGroupSelect={handleGroupSelect}
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
  );
};

export default EmployeeChatPage;
