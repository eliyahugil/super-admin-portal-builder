
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee } from '@/types/supabase';

interface EmployeeNotesTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeNotesTab: React.FC<EmployeeNotesTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState(employee.employee_notes || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({
    content: '',
    note_type: 'general',
    is_warning: false
  });

  const handleAddNote = async () => {
    if (!user?.id) {
      toast.error('חובה להיות מחובר למערכת');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employee_notes')
        .insert({
          employee_id: employeeId,
          business_id: employee.business_id,
          content: newNote.content,
          note_type: newNote.note_type,
          is_warning: newNote.is_warning,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote({ content: '', note_type: 'general', is_warning: false });
      setIsAddDialogOpen(false);
      toast.success('הערה נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('שגיאה בהוספת הערה');
    }
  };

  const handleEditNote = async () => {
    if (!editingNote) return;

    try {
      const { data, error } = await supabase
        .from('employee_notes')
        .update({
          content: editingNote.content,
          note_type: editingNote.note_type,
          is_warning: editingNote.is_warning
        })
        .eq('id', editingNote.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(notes.map(note => note.id === editingNote.id ? data : note));
      setEditingNote(null);
      toast.success('הערה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('שגיאה בעדכון הערה');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('employee_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('הערה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('שגיאה במחיקת הערה');
    }
  };

  const noteTypes = [
    { value: 'general', label: 'כללי' },
    { value: 'performance', label: 'ביצועים' },
    { value: 'attendance', label: 'נוכחות' },
    { value: 'disciplinary', label: 'משמעת' },
    { value: 'training', label: 'הדרכה' },
    { value: 'medical', label: 'רפואי' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            הערות והתראות
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                הוסף הערה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">הוספת הערה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="note-type">סוג הערה</Label>
                  <Select value={newNote.note_type} onValueChange={(value) => setNewNote({...newNote, note_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">תוכן ההערה</Label>
                  <Textarea
                    id="content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="הכנס את תוכן ההערה..."
                    rows={4}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-warning"
                    checked={newNote.is_warning}
                    onChange={(e) => setNewNote({...newNote, is_warning: e.target.checked})}
                  />
                  <Label htmlFor="is-warning">הערת אזהרה</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNote} disabled={!newNote.content.trim()}>
                    הוסף הערה
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={note.is_warning ? "destructive" : "outline"}>
                      {noteTypes.find(t => t.value === note.note_type)?.label || note.note_type}
                    </Badge>
                    {note.is_warning && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(note.created_at).toLocaleDateString('he-IL')} {new Date(note.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הערות</h3>
            <p className="text-gray-500">לא נוספו הערות עבור עובד זה</p>
          </div>
        )}

        {/* Edit Note Dialog */}
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">עריכת הערה</DialogTitle>
            </DialogHeader>
            {editingNote && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-note-type">סוג הערה</Label>
                  <Select 
                    value={editingNote.note_type} 
                    onValueChange={(value) => setEditingNote({...editingNote, note_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-content">תוכן ההערה</Label>
                  <Textarea
                    id="edit-content"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={4}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is-warning"
                    checked={editingNote.is_warning}
                    onChange={(e) => setEditingNote({...editingNote, is_warning: e.target.checked})}
                  />
                  <Label htmlFor="edit-is-warning">הערת אזהרה</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditNote}>
                    שמור שינויים
                  </Button>
                  <Button variant="outline" onClick={() => setEditingNote(null)}>
                    ביטול
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
