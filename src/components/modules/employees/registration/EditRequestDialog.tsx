import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EditRequestDialogProps {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedData: any) => void;
  isUpdating?: boolean;
}

export const EditRequestDialog: React.FC<EditRequestDialogProps> = ({
  request,
  open,
  onOpenChange,
  onUpdate,
  isUpdating = false
}) => {
  const [formData, setFormData] = useState({
    first_name: request?.first_name || '',
    last_name: request?.last_name || '',
    id_number: request?.id_number || '',
    email: request?.email || '',
    phone: request?.phone || '',
    birth_date: request?.birth_date ? new Date(request.birth_date) : null,
    address: request?.address || '',
    branch_assignment_notes: request?.branch_assignment_notes || '',
    shift_preferences: {
      morning: request?.shift_preferences?.morning || false,
      evening: request?.shift_preferences?.evening || false,
      notes: request?.shift_preferences?.notes || ''
    },
    notes: request?.notes || ''
  });

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      birth_date: formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : null
    };
    onUpdate(updatedData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShiftPreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      shift_preferences: {
        ...prev.shift_preferences,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            עריכת בקשת רישום
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* פרטים אישיים */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">פרטים אישיים</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">שם פרטי *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="שם פרטי"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">שם משפחה *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="שם משפחה"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_number">תעודת זהות *</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  placeholder="מספר תעודת זהות"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">תאריך לידה *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birth_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birth_date ? (
                        format(formData.birth_date, "dd/MM/yyyy", { locale: he })
                      ) : (
                        <span>בחר תאריך לידה</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.birth_date}
                      onSelect={(date) => handleInputChange('birth_date', date)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* פרטי התקשרות */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">פרטי התקשרות</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="כתובת אימייל"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="מספר טלפון"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="כתובת מלאה"
              />
            </div>
          </div>

          {/* העדפות משמרות */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">העדפות משמרות</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="morning"
                  checked={formData.shift_preferences.morning}
                  onCheckedChange={(checked) => 
                    handleShiftPreferenceChange('morning', checked)
                  }
                />
                <Label htmlFor="morning">משמרות בוקר</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="evening"
                  checked={formData.shift_preferences.evening}
                  onCheckedChange={(checked) => 
                    handleShiftPreferenceChange('evening', checked)
                  }
                />
                <Label htmlFor="evening">משמרות ערב</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift_notes">הערות על העדפות משמרות</Label>
                <Textarea
                  id="shift_notes"
                  value={formData.shift_preferences.notes}
                  onChange={(e) => handleShiftPreferenceChange('notes', e.target.value)}
                  placeholder="הערות נוספות על העדפות משמרות..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* הערות כלליות */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">הערות</h3>
            
            <div className="space-y-2">
              <Label htmlFor="branch_notes">הערות על הקצאת סניפים</Label>
              <Textarea
                id="branch_notes"
                value={formData.branch_assignment_notes}
                onChange={(e) => handleInputChange('branch_assignment_notes', e.target.value)}
                placeholder="הערות על הקצאת סניפים..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="general_notes">הערות כלליות</Label>
              <Textarea
                id="general_notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="הערות כלליות על הבקשה..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-1" />
            {isUpdating ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};