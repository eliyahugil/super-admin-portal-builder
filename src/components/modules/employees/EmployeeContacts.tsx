
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Plus, 
  AlertTriangle, 
  Info, 
  User, 
  Phone,
  Mail,
  Calendar,
  Trash2 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EmployeeContactsProps {
  employeeId: string;
  employeeName: string;
}

type ContactType = 'phone_call' | 'meeting' | 'email' | 'whatsapp' | 'warning' | 'disciplinary';

export const EmployeeContacts: React.FC<EmployeeContactsProps> = ({ 
  employeeId, 
  employeeName 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    subject: '',
    description: '',
    contact_type: 'phone_call' as ContactType
  });
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['employee-contacts', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_contacts')
        .select(`
          *,
          creator:profiles!employee_contacts_created_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const addContactMutation = useMutation({
    mutationFn: async () => {
      if (!newContact.subject.trim()) throw new Error('נושא הפנייה חובה');
      if (!profile?.id) throw new Error('משתמש לא מזוהה');

      const { error } = await supabase
        .from('employee_contacts')
        .insert({
          employee_id: employeeId,
          subject: newContact.subject.trim(),
          description: newContact.description.trim() || null,
          contact_type: newContact.contact_type,
          created_by: profile.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contacts', employeeId] });
      setNewContact({ subject: '', description: '', contact_type: 'phone_call' });
      setShowAddForm(false);
      toast({
        title: 'הצלחה',
        description: 'הפנייה נוספה בהצלחה',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן להוסיף את הפנייה',
        variant: 'destructive',
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('employee_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contacts', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'הפנייה נמחקה בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את הפנייה',
        variant: 'destructive',
      });
    },
  });

  const getContactTypeIcon = (type: ContactType) => {
    switch (type) {
      case 'phone_call': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'meeting': return <User className="h-4 w-4 text-green-600" />;
      case 'email': return <Mail className="h-4 w-4 text-purple-600" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'disciplinary': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getContactTypeLabel = (type: ContactType) => {
    switch (type) {
      case 'phone_call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'email': return 'אימייל';
      case 'whatsapp': return 'וואטסאפ';
      case 'warning': return 'אזהרה';
      case 'disciplinary': return 'משמעת';
      default: return type;
    }
  };

  const getContactTypeColor = (type: ContactType) => {
    switch (type) {
      case 'phone_call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'whatsapp': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'disciplinary': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">תיעוד פניות וקשרים</h3>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddForm ? 'ביטול' : 'הוסף פנייה'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-2 border-dashed border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">הוספת פנייה חדשה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">סוג פנייה</label>
                <Select 
                  value={newContact.contact_type} 
                  onValueChange={(value: ContactType) => setNewContact({ ...newContact, contact_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone_call">שיחת טלפון</SelectItem>
                    <SelectItem value="meeting">פגישה</SelectItem>
                    <SelectItem value="email">אימייל</SelectItem>
                    <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                    <SelectItem value="warning">אזהרה</SelectItem>
                    <SelectItem value="disciplinary">משמעת</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">נושא</label>
                <Input
                  value={newContact.subject}
                  onChange={(e) => setNewContact({ ...newContact, subject: e.target.value })}
                  placeholder="נושא הפנייה..."
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">תיאור ופרטים</label>
              <Textarea
                value={newContact.description}
                onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                placeholder="תאר את הפנייה, התכנים שנדונו, החלטות שהתקבלו וכו'..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewContact({ subject: '', description: '', contact_type: 'phone_call' });
                }}
              >
                ביטול
              </Button>
              <Button 
                onClick={() => addContactMutation.mutate()}
                disabled={!newContact.subject.trim() || addContactMutation.isPending}
              >
                {addContactMutation.isPending ? 'שומר...' : 'שמור פנייה'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts && contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className={`${['warning', 'disciplinary'].includes(contact.contact_type) ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getContactTypeIcon(contact.contact_type)}
                    <Badge className={getContactTypeColor(contact.contact_type)}>
                      {getContactTypeLabel(contact.contact_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                      disabled={deleteContactMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">{contact.subject}</h4>
                
                {contact.description && (
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{contact.description}</p>
                )}
                
                {contact.creator?.full_name && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    נוצר על ידי {contact.creator.full_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין פניות</h3>
            <p className="text-gray-500 mb-4">לא תועדו עדיין פניות עבור {employeeName}</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              הוסף פנייה ראשונה
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
