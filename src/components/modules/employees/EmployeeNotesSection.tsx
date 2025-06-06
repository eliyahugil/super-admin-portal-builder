
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FileText, Trash2, AlertTriangle, User } from 'lucide-react';
import { useEmployeeNotes } from '@/hooks/useEmployeeNotes';
import { AddEmployeeNoteDialog } from './AddEmployeeNoteDialog';

interface EmployeeNotesSectionProps {
  employeeId: string;
}

export const EmployeeNotesSection: React.FC<EmployeeNotesSectionProps> = ({ employeeId }) => {
  const { notes, isLoading, deleteNote, isDeleting } = useEmployeeNotes(employeeId);

  const noteTypeLabels = {
    general: 'כללי',
    warning: 'אזהרה',
    positive: 'חיובי',
    performance: 'ביצועים',
    communication: 'תקשורת',
  };

  const getNoteTypeVariant = (type: string, isWarning: boolean) => {
    if (isWarning) return 'destructive';
    
    switch (type) {
      case 'positive': return 'default';
      case 'warning': return 'destructive';
      case 'performance': return 'secondary';
      case 'communication': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            הערות והתראות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          הערות והתראות
          {notes && notes.length > 0 && (
            <Badge variant="secondary">{notes.length}</Badge>
          )}
        </CardTitle>
        <AddEmployeeNoteDialog employeeId={employeeId} />
      </CardHeader>
      <CardContent>
        {!notes || notes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>אין הערות עבור עובד זה</p>
            <p className="text-sm mt-2">הוסף הערה ראשונה כדי לתחיל</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getNoteTypeVariant(note.note_type, note.is_warning)}>
                      {note.is_warning && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {noteTypeLabels[note.note_type]}
                    </Badge>
                    {note.is_warning && (
                      <Badge variant="destructive" className="text-xs">
                        אזהרה
                      </Badge>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקת הערה</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק הערה זו? פעולה זו לא ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteNote(note.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          מחק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">{note.content}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{note.creator?.full_name || 'משתמש לא ידוע'}</span>
                  <span>•</span>
                  <span>{new Date(note.created_at).toLocaleDateString('he-IL')}</span>
                  <span>{new Date(note.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
