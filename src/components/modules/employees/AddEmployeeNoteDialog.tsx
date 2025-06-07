
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useEmployeeNotes } from '@/hooks/useEmployeeNotes';
import { useBusiness } from '@/hooks/useBusiness';

interface AddEmployeeNoteDialogProps {
  employeeId: string;
}

export const AddEmployeeNoteDialog: React.FC<AddEmployeeNoteDialogProps> = ({ employeeId }) => {
  const [open, setOpen] = useState(false);
  const [noteType, setNoteType] = useState<'general' | 'warning' | 'positive' | 'performance' | 'communication'>('general');
  const [content, setContent] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  
  const { createNote, isCreating } = useEmployeeNotes(employeeId);
  const { businessId } = useBusiness();

  const noteTypeLabels = {
    general: 'כללי',
    warning: 'אזהרה',
    positive: 'חיובי',
    performance: 'ביצועים',
    communication: 'תקשורת',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !businessId) return;

    createNote({
      employee_id: employeeId,
      business_id: businessId,
      note_type: noteType,
      content: content.trim(),
      is_warning: isWarning,
    });

    // Reset form
    setContent('');
    setNoteType('general');
    setIsWarning(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף הערה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף הערה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="noteType">סוג הערה</Label>
            <Select value={noteType} onValueChange={(value: 'general' | 'warning' | 'positive' | 'performance' | 'communication') => setNoteType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג הערה" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(noteTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">תוכן ההערה</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="כתוב את ההערה כאן..."
              required
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="isWarning"
              checked={isWarning}
              onCheckedChange={setIsWarning}
            />
            <Label htmlFor="isWarning">סמן כהערת אזהרה</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isCreating || !content.trim()}>
              {isCreating ? 'מוסיף...' : 'הוסף הערה'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
