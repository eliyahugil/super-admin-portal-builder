import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Search, Plus, Phone, User } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface WhatsAppChatListProps {
  onContactSelect?: (contactId: string) => void;
  selectedContactId?: string;
}

export const WhatsAppChatList: React.FC<WhatsAppChatListProps> = ({
  onContactSelect,
  selectedContactId
}) => {
  const { contacts, contactsLoading, isConnected } = useWhatsAppIntegration();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  );

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('972')) {
      return `+${phone.slice(0, 3)}-${phone.slice(3, 5)}-${phone.slice(5, 8)}-${phone.slice(8)}`;
    } else if (phone.startsWith('0')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const getContactInitials = (contact: any) => {
    if (contact.name) {
      return contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return contact.phone_number.slice(-2);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            רשימת צ'אטים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>WhatsApp לא מחובר</p>
            <p className="text-sm">התחברו ל-WhatsApp כדי לראות את רשימת הצ'אטים</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          צ'אטים ({contacts.length})
        </CardTitle>
        <CardDescription>
          רשימת אנשי הקשר וההודעות שלכם
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש איש קשר או מספר טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contactsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`
                  flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedContactId === contact.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted/50'
                  }
                `}
                onClick={() => onContactSelect?.(contact.id)}
              >
                <Avatar>
                  <AvatarImage src={contact.profile_picture_url} />
                  <AvatarFallback>
                    {getContactInitials(contact)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {contact.name || 'ללא שם'}
                    </p>
                    {contact.last_seen && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(contact.last_seen), { 
                          addSuffix: true, 
                          locale: he 
                        })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {formatPhoneNumber(contact.phone_number)}
                    </p>
                    {contact.is_blocked && (
                      <Badge variant="destructive" className="text-xs">
                        חסום
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? (
                <>
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>לא נמצאו תוצאות עבור "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>אין עדיין אנשי קשר</p>
                  <p className="text-sm">אנשי קשר יופיעו כאן לאחר שליחת הודעות</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            איש קשר חדש
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};