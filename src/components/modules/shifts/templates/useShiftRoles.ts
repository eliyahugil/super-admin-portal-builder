
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShiftRole {
  id: string;
  name: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
}

export const useShiftRoles = (businessId?: string) => {
  const [roles, setRoles] = useState<ShiftRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    supabase
      .from("shift_roles")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "שגיאה", description: error.message, variant: "destructive" });
        } else if (data) {
          setRoles(data);
        }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [businessId]);

  const addRole = async (name: string) => {
    if (!businessId) {
      toast({ title: "שגיאה", description: "לא נמצא מזהה עסק", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("shift_roles")
      .insert([{ business_id: businessId, name, is_active: true }])
      .select()
      .single();
    if (error || !data) {
      toast({ title: "שגיאה", description: error?.message || "בעיה בהוספת תפקיד", variant: "destructive" });
    } else {
      setRoles((prev) => [...prev, data]);
    }
    setLoading(false);
  };

  return { roles, loading, addRole };
};
