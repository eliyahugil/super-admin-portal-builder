
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeChatMessages } from '@/hooks/useEmployeeChatMessages';
import { useEmployeeChatGroups } from '@/hooks/useEmployeeChatGroups';

export const useChatPage = () => {
  const { profile } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useEmployeesData();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 useChatPage - Profile:', profile?.id, profile?.role);
  console.log('💬 useChatPage - Employees loaded:', employees.length);
  console.log('💬 useChatPage - Selected employee:', selectedEmployeeId);
  console.log('💬 useChatPage - Selected group:', selectedGroupId);

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

  return {
    // Data
    employees,
    groups,
    messages,
    selectedEmployee,
    selectedGroup,
    profile,
    messagesEndRef,
    
    // Loading states
    isLoadingEmployees,
    isLoadingMessages,
    isSending,
    
    // Error states
    employeesError,
    messagesError,
    
    // Form state
    newMessage,
    setNewMessage,
    
    // Handlers
    handleSendMessage,
    handleKeyPress,
    handleEmployeeSelect,
    handleGroupSelect,
  };
};
