-- Enable full replica identity for scheduled_shifts table for real-time updates
ALTER TABLE public.scheduled_shifts REPLICA IDENTITY FULL;