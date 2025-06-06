
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, AlertTriangle, Info, User, MessageSquare, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EmployeeNotesProps {
  employeeId: string;
  employeeName: string;
  canEdit?: boolean;
}

export const EmployeeNotes: React.FC<EmployeeNotesProps> = ({ 
  employeeId, 
  employeeName,
  canEdit = true 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [isWarning, setIsWarning] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['employee-notes', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_notes')
        .select(`
          *,
          creator:profiles!employee_notes_created_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!newNote.trim()) throw new Error('התוכן לא יכול להיות ריק');
      if (!profile?.id) throw new Error('משתמש לא מזוהה');
      if (!businessId) throw new Error('עסק לא מזוהה');

      const { error } = await supabase
        .from('employee_notes')
        .insert({
          employee_id: employeeId,
          business_id: businessId,
          content: newNote.trim(),
          note_type: noteType,
          is_warning: isWarning,
          created_by: profile.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', employeeId] });
      setNewNote('');
      setNoteType('general');
      setIsWarning(false);
      setShowAddForm(false);
      toast({
        title: 'הצלחה',
        description: 'ההערה נוספה בהצלחה',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן להוסיף את ההערה',
        variant: 'destructive',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('employee_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'ההערה נמחקה בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את ההערה',
        variant: 'destructive',
      });
    },
  });

  const getNoteTypeIcon = (type: string, warning: boolean) => {
    if (warning) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    
    switch (type) {
      case 'performance': return <User className="h-4 w-4 text-blue-600" />;
      case 'attendance': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'disciplinary': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'performance': return 'ביצועים';
      case 'attendance': return 'נוכחות';
      case 'disciplinary': return 'משמעת';
      case 'general': return 'כללי';
      default: return type;
    }
  };

  const getNoteTypeColor = (type: string, warning: boolean) => {
    if (warning) return 'bg-red-100 text-red-800 border-red-200';
    
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attendance': return 'bg-green-100 text-green-800 border-green-200';
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
          <StickyNote className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">הערות והערכות</h3>
        </div>
        
        {canEdit && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'ביטול' : 'הוסף הערה'}
          </Button>
        )}
      </div>

      {showAddForm && canEdit && (
        <Card className="border-2 border-dashed border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">הוספת הערה חדשה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">סוג הערה</label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">כללי</SelectItem>
                    <SelectItem value="performance">ביצועים</SelectItem>
                    <SelectItem value="attendance">נוכחות</SelectItem>
                    <SelectItem value="disciplinary">משמעת</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="warning"
                  checked={isWarning}
                  onChange={(e) => setIsWarning(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="warning" className="text-sm font-medium">
                  סמן כאזהרה
                </label>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">תוכן ההערה</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="כתוב את ההערה כאן..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewNote('');
                  setNoteType('general');
                  setIsWarning(false);
                }}
              >
                ביטול
              </Button>
              <Button 
                onClick={() => addNoteMutation.mutate()}
                disabled={!newNote.trim() || addNoteMutation.isPending}
              >
                {addNoteMutation.isPending ? 'שומר...' : 'שמור הערה'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className={`${note.is_warning ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getNoteTypeIcon(note.note_type, note.is_warning)}
                    <Badge className={getNoteTypeColor(note.note_type, note.is_warning)}>
                      {getNoteTypeLabel(note.note_type)}
                      {note.is_warning && ' - אזהרה'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </div>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{note.content}</p>
                
                {note.creator?.full_name && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    נכתב על ידי {note.creator.full_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הערות</h3>
            <p className="text-gray-500 mb-4">לא נכתבו עדיין הערות עבור {employeeName}</p>
            {canEdit && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                הוסף הערה ראשונה
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
