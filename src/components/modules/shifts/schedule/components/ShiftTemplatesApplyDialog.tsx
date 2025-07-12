import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users, Building, Copy } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  required_employees: number;
  is_active: boolean;
  branch_id: string;
  business_id: string;
  created_at: string;
}

interface Branch {
  id: string;
  name: string;
}

interface ShiftTemplatesApplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onShiftsCreated: () => void;
}

const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  morning: 'בוקר',
  afternoon: 'צהריים',
  evening: 'ערב',
  night: 'לילה'
};

export const ShiftTemplatesApplyDialog: React.FC<ShiftTemplatesApplyDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onShiftsCreated
}) => {
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [applyToWeek, setApplyToWeek] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates = [] } = useRealData<ShiftTemplate>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    filters: { is_active: true },
    enabled: !!businessId && isOpen
  });

  const { data: branches = [] } = useRealData<Branch>({
    queryKey: ['branches-for-templates-apply', businessId],
    tableName: 'branches',
    filters: { is_active: true },
    enabled: !!businessId && isOpen
  });

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'לא מוגדר';
  };

  const handleTemplateSelect = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const createShiftsFromTemplates = async () => {
    if (!selectedDate || selectedTemplates.size === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר תבניות וודא שיש תאריך נבחר",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const selectedTemplateData = templates.filter(t => selectedTemplates.has(t.id));
      const shifts = [];

      if (applyToWeek && selectedDate) {
        // יצירת משמרות לכל השבוע
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // ראשון
        for (let i = 0; i < 7; i++) {
          const currentDate = addDays(weekStart, i);
          for (const template of selectedTemplateData) {
            shifts.push({
              shift_date: format(currentDate, 'yyyy-MM-dd'),
              start_time: template.start_time,
              end_time: template.end_time,
              branch_id: template.branch_id,
              role: SHIFT_TYPE_LABELS[template.shift_type],
              required_employees: template.required_employees,
              business_id: businessId,
              employee_id: null,
              notes: `נוצר מתבנית: ${template.name}`,
              status: 'open'
            });
          }
        }
      } else {
        // יצירת משמרות ליום נבחר בלבד
        for (const template of selectedTemplateData) {
          shifts.push({
            shift_date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: template.start_time,
            end_time: template.end_time,
            branch_id: template.branch_id,
            role: SHIFT_TYPE_LABELS[template.shift_type],
            required_employees: template.required_employees,
            business_id: businessId,
            employee_id: null,
            notes: `נוצר מתבנית: ${template.name}`,
            status: 'open'
          });
        }
      }

      const { error } = await supabase
        .from('scheduled_shifts')
        .insert(shifts);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `נוצרו ${shifts.length} משמרות מתבניות`
      });

      setSelectedTemplates(new Set());
      setApplyToWeek(false);
      onShiftsCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת משמרות: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            יישום תבניות משמרות
          </DialogTitle>
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              תאריך נבחר: {format(selectedDate, 'dd/MM/yyyy', { locale: he })}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* אפשרויות יישום */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">אפשרויות יישום</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="apply-to-week"
                checked={applyToWeek}
                onCheckedChange={(checked) => setApplyToWeek(checked === true)}
              />
              <Label htmlFor="apply-to-week" className="cursor-pointer">
                יישם על כל השבוע (ראשון עד שבת)
              </Label>
            </div>
          </div>

          {/* רשימת תבניות */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              תבניות זמינות ({templates.length})
            </Label>
            
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>אין תבניות משמרות זמינות</p>
                <p className="text-sm mt-1">צור תבניות במסך ניהול תבניות משמרות</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplates.has(template.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {template.name}
                        </CardTitle>
                        <Checkbox
                          checked={selectedTemplates.has(template.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{template.start_time} - {template.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{getBranchName(template.branch_id)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{template.required_employees} עובדים נדרשים</span>
                        </div>
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {SHIFT_TYPE_LABELS[template.shift_type]}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* סיכום */}
          {selectedTemplates.size > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">סיכום</h4>
              <p className="text-sm text-muted-foreground">
                {selectedTemplates.size} תבניות נבחרו
                {applyToWeek 
                  ? ` • יווצרו ${selectedTemplates.size * 7} משמרות לשבוע שלם`
                  : ` • יווצרו ${selectedTemplates.size} משמרות ליום נבחר`
                }
              </p>
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              onClick={createShiftsFromTemplates}
              disabled={selectedTemplates.size === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  יוצר משמרות...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  יצור משמרות ({selectedTemplates.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};