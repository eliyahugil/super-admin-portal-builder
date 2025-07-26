
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone } from 'lucide-react';

interface EmployeeNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone?: string) => void;
  isLoading?: boolean;
}

const EmployeeNameDialog: React.FC<EmployeeNameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), phone.trim() || undefined);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            פרטי העובד
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם מלא *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס את שמך המלא"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">מספר טלפון (אופציונלי)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="הכנס מספר טלפון"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'שולח...' : 'המשך'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeNameDialog;
