import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConnection } from './WhatsAppConnection';
import { WhatsAppChatList } from './WhatsAppChatList';
import { WhatsAppChat } from './WhatsAppChat';
import { WhatsAppBusinessSettings } from './WhatsAppBusinessSettings';
import { WhatsAppMessages } from './WhatsAppMessages';
import { MessageSquare, Smartphone, Users, Settings } from 'lucide-react';

export const WhatsAppDashboard: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <div className="w-80 border-r bg-card">
        <Tabs defaultValue="chats" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              צ'אטים
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              אנשי קשר
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              חיבור
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              הגדרות API
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chats" className="flex-1 p-0">
            <WhatsAppChatList 
              selectedContactId={selectedContactId}
              onContactSelect={setSelectedContactId}
            />
          </TabsContent>
          
          <TabsContent value="contacts" className="flex-1 p-0">
            <div className="h-full overflow-auto">
              <WhatsAppMessages />
            </div>
          </TabsContent>
          
          <TabsContent value="connection" className="flex-1 p-0">
            <WhatsAppConnection />
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 p-0">
            <WhatsAppBusinessSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex-1">
        {selectedContactId ? (
          <WhatsAppChat contactId={selectedContactId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">ברוכים הבאים ל-WhatsApp Business</h3>
              <p>בחרו צ'אט כדי להתחיל לשוחח</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};