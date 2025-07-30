-- הפעלת real-time updates לטבלת scheduled_shifts
ALTER TABLE public.scheduled_shifts REPLICA IDENTITY FULL;

-- הוספת הטבלה לפרסום real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_shifts;