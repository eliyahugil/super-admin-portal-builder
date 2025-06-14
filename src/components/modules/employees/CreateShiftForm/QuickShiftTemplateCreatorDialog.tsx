
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickShiftTemplateCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onTemplateCreated: (template: any) => void;
}

export const QuickShiftTemplateCreatorDialog: React.FC<QuickShiftTemplateCreatorDialogProps> = ({
  open,
  onOpenChange,
  businessId,
  onTemplateCreated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!form.name || !form.start_time || !form.end_time) {
      toast({
        title: "חסרים שדות",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_templates")
        .insert([
          {
            name: form.name,
            start_time: form.start_time,
            end_time: form.end_time,
            business_id: businessId,
            is_active: true,
            required_employees: 1,
            shift_type: "morning",
            branch_id: null,
          },
        ])
        .select()
        .single();

      if (error || !data) throw error || new Error("לא התקבלה תבנית");

      onTemplateCreated(data);
      toast({ title: "הצלחה", description: "תבנית המשמרת נוצרה!" });
      setForm({ name: "", start_time: "", end_time: "" });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "שגיאה",
        description: err.message || "שגיאה בשמירה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>תבנית משמרת חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template-name">שם התבנית *</Label>
            <Input
              id="template-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="למשל: בוקר"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="start_time">שעת התחלה *</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end_time">שעת סיום *</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "יוצר..." : "צור תבנית"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
