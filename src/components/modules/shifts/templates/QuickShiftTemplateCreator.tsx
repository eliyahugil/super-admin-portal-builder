import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, MapPin, Users, Trash2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useRealData } from '@/hooks/useRealData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface QuickTemplateData {
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  branch_id: string;
  required_employees: number;
}

interface QuickShiftTemplateCreatorProps {
  onTemplateCreated?: () => void;
}

export const QuickShiftTemplateCreator: React.FC<QuickShiftTemplateCreatorProps> = ({ 
  onTemplateCreated 
}) => {
  const { businessId } = useBusiness();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [templateData, setTemplateData] = useState<QuickTemplateData>({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    shift_type: 'morning',
    branch_id: '',
    required_employees: 1
  });

  const { data: branches } = useRealData<any>({
    queryKey: ['branches-quick-template', businessId],
    tableName: 'branches',
    filters: { is_active: true },
    enabled: !!businessId
  });

  const quickTemplates = [
    { name: 'משמרת בוקר', start_time: '07:00', end_time: '15:00', shift_type: 'morning' as ShiftType },
    { name: 'משמרת צהריים', start_time: '15:00', end_time: '23:00', shift_type: 'afternoon' as ShiftType },
    { name: 'משמרת ערב', start_time: '17:00', end_time: '01:00', shift_type: 'evening' as ShiftType },
    { name: 'משמרת לילה', start_time: '23:00', end_time: '07:00', shift_type: 'night' as ShiftType }
  ];

  // This new state manages which quick templates are visible
  const [hiddenQuickTemplates, setHiddenQuickTemplates] = useState<number[]>([]);

  const handleQuickCreate = async (template: typeof quickTemplates[0]) => {
    if (!businessId || !branches || branches.length === 0) {
      toast({
        title: "שגיאה",
        description: "צריך להיות לפחות סניף אחד כדי ליצור תבנית משמרת",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('shift_templates')
        .insert({
          name: template.name,
          business_id: businessId,
          branch_id: branches[0].id,
          start_time: template.start_time,
          end_time: template.end_time,
          shift_type: template.shift_type,
          required_employees: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `תבנית "${template.name}" נוצרה בהצלחה`
      });

      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת התבנית: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomCreate = async () => {
    if (!businessId || !templateData.name || !templateData.branch_id) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('shift_templates')
        .insert({
          name: templateData.name,
          business_id: businessId,
          branch_id: templateData.branch_id,
          start_time: templateData.start_time,
          end_time: templateData.end_time,
          shift_type: templateData.shift_type,
          required_employees: templateData.required_employees,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `תבנית "${templateData.name}" נוצרה בהצלחה`
      });

      // Reset form
      setTemplateData({
        name: '',
        start_time: '09:00',
        end_time: '17:00',
        shift_type: 'morning',
        branch_id: '',
        required_employees: 1
      });
      setIsExpanded(false);

      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת התבנית: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler to 'delete' quick template (hide from local list)
  const handleDeleteQuickTemplate = (index: number) => {
    setHiddenQuickTemplates((prev) => [...prev, index]);
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          יצירת תבנית משמרת מהירה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Templates */}
        <div>
          <Label className="text-sm font-medium mb-3 block">תבניות מהירות</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickTemplates.map((template, index) => (
              hiddenQuickTemplates.includes(index) ? null : (
                <div className="relative" key={index}>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickCreate(template)}
                    disabled={submitting || !branches || branches.length === 0}
                    className="h-auto p-3 flex flex-col items-start text-right w-full"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {template.start_time} - {template.end_time}
                    </span>
                  </Button>
                  {/* Delete icon (X) to hide quick template */}
                  <button
                    type="button"
                    aria-label="הסתר תבנית"
                    className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition"
                    onClick={() => handleDeleteQuickTemplate(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Custom Template Creator */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            <span>תבנית מותאמת אישית</span>
            <Plus className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
          </Button>

          {isExpanded && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-name">שם התבנית</Label>
                  <Input
                    id="custom-name"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    placeholder="למשל: משמרת מיוחדת"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-branch">סניף</Label>
                  <Select value={templateData.branch_id} onValueChange={(value) => setTemplateData({ ...templateData, branch_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סניף" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {branch.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom-start">שעת התחלה</Label>
                  <Input
                    id="custom-start"
                    type="time"
                    value={templateData.start_time}
                    onChange={(e) => setTemplateData({ ...templateData, start_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-end">שעת סיום</Label>
                  <Input
                    id="custom-end"
                    type="time"
                    value={templateData.end_time}
                    onChange={(e) => setTemplateData({ ...templateData, end_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-employees">מספר עובדים</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Input
                      id="custom-employees"
                      type="number"
                      min="1"
                      value={templateData.required_employees}
                      onChange={(e) => setTemplateData({ ...templateData, required_employees: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-type">סוג משמרת</Label>
                <Select value={templateData.shift_type} onValueChange={(value: ShiftType) => setTemplateData({ ...templateData, shift_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">בוקר</SelectItem>
                    <SelectItem value="afternoon">צהריים</SelectItem>
                    <SelectItem value="evening">ערב</SelectItem>
                    <SelectItem value="night">לילה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCustomCreate}
                disabled={submitting || !templateData.name || !templateData.branch_id}
                className="w-full"
              >
                {submitting ? 'יוצר...' : 'צור תבנית מותאמת'}
              </Button>
            </div>
          )}
        </div>

        {!branches || branches.length === 0 && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              יש ליצור לפחות סניף אחד כדי ליצור תבניות משמרות
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
