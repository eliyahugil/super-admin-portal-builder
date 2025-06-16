
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeChatMessages } from '@/hooks/useEmployeeChatMessages';
import { EmployeeChatSidebar } from '@/components/modules/employees/chat/EmployeeChatSidebar';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { EmployeeChatMessage } from '@/types/employee-chat';

const EmployeeChatPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useEmployeesData();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 EmployeeChatPage - Profile:', profile?.id, profile?.role);
  console.log('💬 EmployeeChatPage - Employees loaded:', employees.length);
  console.log('💬 EmployeeChatPage - Selected employee:', selectedEmployeeId);

  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
    isSending,
  } = useEmployeeChatMessages(selectedEmployeeId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedEmployeeId) {
      console.log('📤 Sending message:', newMessage);
      sendMessage({
        employeeId: selectedEmployeeId,
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

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
    return (
      <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex items-center justify-center" dir="rtl">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">שגיאה בטעינת העובדים</span>
          </div>
          <p className="text-gray-600">לא ניתן לטעון את רשימת העובדים. אנא נסה שוב מאוחר יותר.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex gap-4" dir="rtl">
      {/* Employees List Sidebar */}
      <EmployeeChatSidebar
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeSelect={setSelectedEmployeeId}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedEmployee ? (
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                צ'אט עם {selectedEmployee.first_name} {selectedEmployee.last_name}
                {selectedEmployee.phone && (
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedEmployee.phone})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">טוען הודעות...</div>
                  </div>
                ) : messagesError ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-red-500 text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                      שגיאה בטעינת ההודעות
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500 text-center">
                      <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                      עדיין אין הודעות עם העובד הזה
                      <br />
                      שלח הודעה ראשונה כדי להתחיל את השיחה
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: EmployeeChatMessage) => {
                      const isFromCurrentUser = message.sender_id === profile?.id;
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
                                    {getInitials(
                                      `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1">
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
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`כתוב הודעה ל${selectedEmployee.first_name}...`}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                בחר עובד כדי להתחיל צ'אט
              </h3>
              <p className="text-gray-600">
                בחר עובד מהרשימה כדי לשלוח לו הודעות אישיות
              </p>
              {employees.length === 0 && (
                <p className="text-orange-600 mt-2">
                  לא נמצאו עובדים פעילים בעסק זה
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeChatPage;
