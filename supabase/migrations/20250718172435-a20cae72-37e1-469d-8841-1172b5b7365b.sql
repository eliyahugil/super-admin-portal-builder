-- הפעלת realtime עבור טבלת הגשות משמרות
ALTER TABLE public.employee_shift_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_shift_requests;