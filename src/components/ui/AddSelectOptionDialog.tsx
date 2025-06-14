
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddSelectOptionDialogProps {
  onAddOption: (newOption: string) => Promise<boolean>;
  placeholder?: string;
  buttonText?: string;
  dialogTitle?: string;
  optionLabel?: string;
}

export const AddSelectOptionDialog: React.FC<AddSelectOptionDialogProps> = ({
  onAddOption,
  placeholder = "הכנס אפשרות חדשה",
  buttonText = "הוסף אפשרות",
  dialogTitle = "הוספת אפשרות חדשה",
  optionLabel = "שם האפשרות"
}) => {
  const [open, setOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOption.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם לאפשרות",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await onAddOption(newOption.trim());
      if (success) {
        setNewOption('');
        setOpen(false);
        toast({
          title: "הצלחה",
          description: "האפשרות נוספה בהצלחה"
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת האפשרות",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 ml-2"
          title={buttonText}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new-option">{optionLabel}</Label>
            <Input
              id="new-option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder={placeholder}
              required
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'מוסיף...' : 'הוסף'}
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
